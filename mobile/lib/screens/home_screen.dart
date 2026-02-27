import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Belvedere'),
        actions: [
          if (auth.isAuthenticated)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Center(
                child: Text(
                  auth.user?.name ?? '',
                  style: const TextStyle(fontSize: 13),
                ),
              ),
            ),
          IconButton(
            icon: Icon(
              auth.isAuthenticated ? Icons.logout : Icons.login,
            ),
            tooltip: auth.isAuthenticated ? 'Sign Out' : 'Sign In',
            onPressed: () {
              if (auth.isAuthenticated) {
                auth.signOut();
              } else {
                Navigator.pushNamed(context, '/signin');
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 16),
            // Hero area
            Container(
              padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    theme.colorScheme.primary,
                    theme.colorScheme.primaryContainer,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                children: [
                  Icon(Icons.villa, size: 56, color: Colors.white.withValues(alpha: 0.9)),
                  const SizedBox(height: 12),
                  const Text(
                    'Belvedere',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Pre-arrival supply ordering\nfor vacation rentals',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 15,
                      color: Colors.white.withValues(alpha: 0.85),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            if (!auth.isAuthenticated) ...[
              _NavCard(
                icon: Icons.login,
                label: 'Sign In',
                subtitle: 'Access your account',
                color: theme.colorScheme.primary,
                onTap: () => Navigator.pushNamed(context, '/signin'),
              ),
              const SizedBox(height: 12),
            ],

            _NavCard(
              icon: Icons.dashboard,
              label: 'Owner Portal',
              subtitle: 'Manage properties & approve carts',
              color: const Color(0xFF2E7D32),
              onTap: () {
                if (!auth.isAuthenticated) {
                  Navigator.pushNamed(context, '/signin');
                } else {
                  Navigator.pushNamed(context, '/owner');
                }
              },
            ),
            const SizedBox(height: 12),
            _NavCard(
              icon: Icons.store,
              label: 'Marketplace',
              subtitle: 'Find property managers by region',
              color: const Color(0xFF1565C0),
              onTap: () => Navigator.pushNamed(context, '/marketplace'),
            ),
            const SizedBox(height: 12),
            _NavCard(
              icon: Icons.bar_chart,
              label: 'Statistics',
              subtitle: 'Platform activity & KPIs',
              color: const Color(0xFF6A1B9A),
              onTap: () => Navigator.pushNamed(context, '/statistics'),
            ),
            const SizedBox(height: 32),

            if (auth.isAuthenticated)
              Center(
                child: TextButton.icon(
                  icon: const Icon(Icons.logout),
                  label: const Text('Sign Out'),
                  onPressed: auth.signOut,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _NavCard extends StatelessWidget {
  const _NavCard({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: color.withValues(alpha: 0.1),
                radius: 24,
                child: Icon(icon, color: color, size: 26),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: Colors.grey[400]),
            ],
          ),
        ),
      ),
    );
  }
}
