import 'package:flutter/foundation.dart';

import '../api/api_client.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthUser {
  const AuthUser({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
  });

  final String id;
  final String email;
  final String name;
  final String role;

  factory AuthUser.fromSession(Map<String, dynamic> session) {
    final user = session['user'] as Map<String, dynamic>;
    return AuthUser(
      id: (user['id'] as String?) ?? '',
      email: (user['email'] as String?) ?? '',
      name: (user['name'] as String?) ?? '',
      role: (user['role'] as String?) ?? 'GUEST',
    );
  }
}

class AuthProvider extends ChangeNotifier {
  AuthStatus _status = AuthStatus.unknown;
  AuthUser? _user;
  String? _error;

  AuthStatus get status => _status;
  AuthUser? get user => _user;
  String? get error => _error;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  AuthProvider() {
    _loadSession();
  }

  Future<void> _loadSession() async {
    try {
      final session = await ApiClient.instance.getSession();
      if (session != null) {
        _user = AuthUser.fromSession(session);
        _status = AuthStatus.authenticated;
      } else {
        _status = AuthStatus.unauthenticated;
      }
    } catch (_) {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<bool> signIn(String email, String password) async {
    _error = null;
    try {
      await ApiClient.instance.signIn(email, password);
      final session = await ApiClient.instance.getSession();
      if (session != null) {
        _user = AuthUser.fromSession(session);
        _status = AuthStatus.authenticated;
        notifyListeners();
        return true;
      } else {
        _error = 'Invalid email or password.';
        _status = AuthStatus.unauthenticated;
        notifyListeners();
        return false;
      }
    } on ApiException catch (e) {
      _error = e.message;
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return false;
    }
  }

  Future<void> signOut() async {
    await ApiClient.instance.clearCookies();
    _user = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }
}
