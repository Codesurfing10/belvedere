import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'providers/auth_provider.dart';
import 'screens/home_screen.dart';
import 'screens/sign_in_screen.dart';
import 'screens/owner_dashboard_screen.dart';
import 'screens/marketplace_screen.dart';
import 'screens/statistics_screen.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: const BelvedereApp(),
    ),
  );
}

class BelvedereApp extends StatelessWidget {
  const BelvedereApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Belvedere',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1A3A5C),
        ),
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1A3A5C),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (_) => const HomeScreen(),
        '/signin': (_) => const SignInScreen(),
        '/owner': (_) => const OwnerDashboardScreen(),
        '/marketplace': (_) => const MarketplaceScreen(),
        '/statistics': (_) => const StatisticsScreen(),
      },
    );
  }
}
