/// Compile-time configurable API base URL.
///
/// Override at build time with:
///   flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000
const String kApiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:3000',
);
