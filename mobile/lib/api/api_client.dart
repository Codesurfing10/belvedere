import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'constants.dart';

/// Simple HTTP client that persists NextAuth session cookies across requests.
///
/// NextAuth uses cookie-based sessions (JWT strategy). After a successful
/// POST to /api/auth/callback/credentials the server returns a
/// `next-auth.session-token` cookie that must be echoed back in every
/// subsequent request via the `Cookie` header.
///
/// Limitations
/// -----------
/// * CSRF protection: NextAuth requires a valid `csrfToken` for the
///   credentials callback.  We fetch it automatically via GET /api/auth/csrf.
/// * Secure cookies: In production NextAuth sets `__Secure-next-auth.*`
///   cookies which are only sent over HTTPS.  Against a local dev server
///   the plain `next-auth.session-token` cookie is used (HTTP is fine).
/// * For Android emulator use API_BASE_URL=http://10.0.2.2:3000;
///   for iOS simulator use the default http://localhost:3000.
class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  static const _cookieKey = 'belvedere_cookies';

  final String baseUrl = kApiBaseUrl;

  // ---------------------------------------------------------------------------
  // Cookie persistence
  // ---------------------------------------------------------------------------

  /// Returns stored cookies as a `Cookie: name=value; name2=value2` string.
  Future<String> _loadCookieHeader() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString(_cookieKey) ?? '{}';
    final Map<String, dynamic> jar =
        jsonDecode(stored) as Map<String, dynamic>;
    return jar.entries.map((e) => '${e.key}=${e.value}').join('; ');
  }

  /// Persists cookies from a `Set-Cookie` response header.
  Future<void> _saveCookies(http.Response response) async {
    final raw = response.headers['set-cookie'];
    if (raw == null || raw.isEmpty) return;

    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString(_cookieKey) ?? '{}';
    final Map<String, dynamic> jar =
        jsonDecode(stored) as Map<String, dynamic>;

    // Each cookie can be separated by a comma when multiple are present,
    // but the value itself may contain commas (e.g. dates).  We split on
    // "; " first to strip attributes, then on ", " for multiple cookies.
    for (final segment in raw.split(RegExp(r',(?=[^ ])'))) {
      final nameValue = segment.split(';').first.trim();
      final eqIndex = nameValue.indexOf('=');
      if (eqIndex <= 0) continue;
      final name = nameValue.substring(0, eqIndex).trim();
      final value = nameValue.substring(eqIndex + 1).trim();
      jar[name] = value;
    }

    await prefs.setString(_cookieKey, jsonEncode(jar));
  }

  Future<void> clearCookies() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_cookieKey);
  }

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

  /// Signs in with email + password via NextAuth CredentialsProvider.
  /// Returns true on success, throws [ApiException] on failure.
  Future<void> signIn(String email, String password) async {
    // 1. Fetch CSRF token
    final csrfResponse = await get('/api/auth/csrf');
    final csrfToken =
        (csrfResponse['csrfToken'] as String?) ?? '';

    // 2. POST credentials to NextAuth callback
    final cookieHeader = await _loadCookieHeader();
    final uri = Uri.parse('$baseUrl/api/auth/callback/credentials');
    final response = await http.post(
      uri,
      headers: {
        HttpHeaders.contentTypeHeader:
            'application/x-www-form-urlencoded',
        if (cookieHeader.isNotEmpty) HttpHeaders.cookieHeader: cookieHeader,
      },
      body: {
        'csrfToken': csrfToken,
        'email': email,
        'password': password,
        'callbackUrl': '$baseUrl/',
        'json': 'true',
      },
    );

    await _saveCookies(response);

    if (response.statusCode >= 400) {
      throw ApiException('Sign-in failed (${response.statusCode})');
    }

    // NextAuth redirects (302) to the callbackUrl on success.
    // A 200 with an error JSON body also indicates failure.
    if (response.statusCode == 200) {
      // Some NextAuth configurations return 200 with an error field
      try {
        final body = jsonDecode(response.body) as Map<String, dynamic>;
        if (body['error'] != null) {
          throw ApiException('Sign-in failed: ${body['error']}');
        }
      } catch (_) {
        // Not JSON – that is fine (HTML redirect page)
      }
    }
  }

  /// Fetches the current session from NextAuth.
  Future<Map<String, dynamic>?> getSession() async {
    try {
      final data = await get('/api/auth/session');
      if (data.isEmpty || data['user'] == null) return null;
      return data;
    } catch (_) {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Generic HTTP helpers
  // ---------------------------------------------------------------------------

  Future<Map<String, dynamic>> get(String path,
      {Map<String, String>? queryParams}) async {
    final cookieHeader = await _loadCookieHeader();
    var uri = Uri.parse('$baseUrl$path');
    if (queryParams != null && queryParams.isNotEmpty) {
      uri = uri.replace(queryParameters: queryParams);
    }
    final response = await http.get(
      uri,
      headers: {
        HttpHeaders.acceptHeader: 'application/json',
        if (cookieHeader.isNotEmpty) HttpHeaders.cookieHeader: cookieHeader,
      },
    );
    await _saveCookies(response);
    _checkStatus(response);
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<List<dynamic>> getList(String path,
      {Map<String, String>? queryParams}) async {
    final cookieHeader = await _loadCookieHeader();
    var uri = Uri.parse('$baseUrl$path');
    if (queryParams != null && queryParams.isNotEmpty) {
      uri = uri.replace(queryParameters: queryParams);
    }
    final response = await http.get(
      uri,
      headers: {
        HttpHeaders.acceptHeader: 'application/json',
        if (cookieHeader.isNotEmpty) HttpHeaders.cookieHeader: cookieHeader,
      },
    );
    await _saveCookies(response);
    _checkStatus(response);
    return jsonDecode(response.body) as List<dynamic>;
  }

  Future<Map<String, dynamic>> post(
      String path, Map<String, dynamic> body) async {
    final cookieHeader = await _loadCookieHeader();
    final uri = Uri.parse('$baseUrl$path');
    final response = await http.post(
      uri,
      headers: {
        HttpHeaders.contentTypeHeader: 'application/json',
        HttpHeaders.acceptHeader: 'application/json',
        if (cookieHeader.isNotEmpty) HttpHeaders.cookieHeader: cookieHeader,
      },
      body: jsonEncode(body),
    );
    await _saveCookies(response);
    _checkStatus(response);
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  void _checkStatus(http.Response response) {
    if (response.statusCode >= 400) {
      String message = 'HTTP ${response.statusCode}';
      try {
        final body = jsonDecode(response.body) as Map<String, dynamic>;
        message = (body['error'] as String?) ?? message;
      } catch (_) {}
      throw ApiException(message, statusCode: response.statusCode);
    }
  }
}

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});
  final String message;
  final int? statusCode;

  @override
  String toString() => 'ApiException($statusCode): $message';
}
