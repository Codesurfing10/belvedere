# Belvedere Mobile

Flutter application (iOS + Android) for the Belvedere pre-arrival supply ordering platform.  
Consumes the existing Next.js backend API.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Flutter (stable) | ≥ 3.27 |
| Dart | ≥ 3.3 |
| Xcode (iOS only) | ≥ 15 |
| Android Studio / SDK | API 21+ |

Install Flutter: <https://docs.flutter.dev/get-started/install>

---

## Quick start

```bash
cd mobile
flutter pub get
flutter run
```

---

## Configuring the API base URL

The app uses a compile-time constant for the backend URL:

```
API_BASE_URL   (default: http://localhost:3000)
```

Pass it with `--dart-define`:

```bash
# iOS Simulator (default works):
flutter run --dart-define=API_BASE_URL=http://localhost:3000

# Android Emulator (maps 10.0.2.2 → host localhost):
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000

# Real device on LAN (replace with your machine's LAN IP):
flutter run --dart-define=API_BASE_URL=http://192.168.1.100:3000
```

---

## Running the backend locally

```bash
# In the repo root:
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, REDIS_URL

pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev          # starts on http://localhost:3000
```

---

## HTTP / cleartext (dev only)

### Android

`android/app/src/main/AndroidManifest.xml` has:
```xml
android:usesCleartextTraffic="true"
```
Remove this attribute and update `API_BASE_URL` to an `https://` endpoint before shipping to the Play Store.

### iOS

`ios/Runner/Info.plist` has an `NSAppTransportSecurity` exception for `localhost` via `NSAllowsLocalNetworking: true`.  
Remove the ATS exception block and use an `https://` URL in production.

---

## Authentication

The app uses NextAuth CredentialsProvider (email + password).  
On sign-in, it:

1. Fetches a CSRF token from `GET /api/auth/csrf`
2. POSTs credentials to `/api/auth/callback/credentials`
3. Persists the `next-auth.session-token` cookie with `shared_preferences`
4. Includes the cookie on all subsequent API requests

**Limitation:** In production NextAuth sets `__Secure-next-auth.*` cookies which require HTTPS. Against the local dev server (`http://`) the plain `next-auth.session-token` is used and this flow works.  
If the sign-in fails with a 401 on subsequent requests, ensure:
- The backend is running (`pnpm dev`)
- `NEXTAUTH_SECRET` is set in `.env.local`
- `API_BASE_URL` points to the correct host (see above)

### Demo accounts (password: `password`)

| Role    | Email                    |
|---------|--------------------------|
| Owner   | owner@example.com        |
| Guest   | guest@example.com        |
| Manager | manager@example.com      |
| Admin   | admin@example.com        |

The Sign In screen has quick-fill chips for each demo account.

---

## Features

| Screen | Description |
|--------|-------------|
| Home | Landing page with navigation to all sections |
| Sign In | Email/password with demo account chips |
| Owner Dashboard | Lists properties; shows and approves/rejects SUGGESTED carts |
| Marketplace | Lists property managers, filterable by region or ZIP code |
| Manager Detail | Manager bio, star rating, service regions, and reviews |
| Statistics | KPI cards, monthly reservations & revenue bar charts, top categories |

---

## Running tests

```bash
cd mobile
flutter test
```

---

## Flutter analyze

```bash
cd mobile
flutter analyze
```

---

## Project structure

```
mobile/
├── lib/
│   ├── main.dart              # App entry point
│   ├── api/
│   │   └── api_client.dart    # HTTP client with cookie persistence
│   ├── models/
│   │   ├── property.dart
│   │   ├── cart.dart
│   │   ├── property_manager.dart
│   │   └── stats.dart
│   ├── providers/
│   │   └── auth_provider.dart # NextAuth session state (Provider)
│   └── screens/
│       ├── home_screen.dart
│       ├── sign_in_screen.dart
│       ├── owner_dashboard_screen.dart
│       ├── marketplace_screen.dart
│       ├── manager_detail_screen.dart
│       └── statistics_screen.dart
├── assets/
│   └── stats.json             # Bundled copy of public/stats.json
├── android/                   # Android project
├── ios/                       # iOS project
├── test/
│   └── stats_model_test.dart
├── pubspec.yaml
└── analysis_options.yaml
```
