import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  bool _obscurePassword = true;

  static const _demoAccounts = [
    _DemoAccount('Owner', 'owner@example.com', Icons.home, Color(0xFF2E7D32)),
    _DemoAccount('Guest', 'guest@example.com', Icons.person, Color(0xFF1565C0)),
    _DemoAccount(
        'Manager', 'manager@example.com', Icons.manage_accounts, Color(0xFFE65100)),
    _DemoAccount('Admin', 'admin@example.com', Icons.admin_panel_settings,
        Color(0xFF6A1B9A)),
  ];

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);

    final auth = context.read<AuthProvider>();
    final ok =
        await auth.signIn(_emailController.text.trim(), _passwordController.text);

    if (!mounted) return;
    setState(() => _loading = false);

    if (ok) {
      Navigator.pop(context);
    }
  }

  void _fillDemo(_DemoAccount account) {
    _emailController.text = account.email;
    _passwordController.text = 'password';
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Sign In')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 8),
              // Demo accounts
              const Text(
                'Quick-fill demo accounts',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _demoAccounts
                    .map(
                      (a) => ActionChip(
                        avatar: Icon(a.icon, size: 16, color: a.color),
                        label: Text(a.label),
                        onPressed: () => _fillDemo(a),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 24),

              // Sign-in form
              Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        prefixIcon: Icon(Icons.email_outlined),
                        border: OutlineInputBorder(),
                      ),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) {
                          return 'Email is required';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      decoration: InputDecoration(
                        labelText: 'Password',
                        prefixIcon: const Icon(Icons.lock_outline),
                        border: const OutlineInputBorder(),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                          ),
                          onPressed: () =>
                              setState(() => _obscurePassword = !_obscurePassword),
                        ),
                      ),
                      validator: (v) {
                        if (v == null || v.isEmpty) return 'Password is required';
                        return null;
                      },
                      onFieldSubmitted: (_) => _submit(),
                    ),
                    const SizedBox(height: 8),
                    if (auth.error != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 4, bottom: 4),
                        child: Text(
                          auth.error!,
                          style: const TextStyle(color: Colors.red, fontSize: 13),
                        ),
                      ),
                    const SizedBox(height: 20),
                    FilledButton(
                      onPressed: _loading ? null : _submit,
                      child: _loading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text('Sign In'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DemoAccount {
  const _DemoAccount(this.label, this.email, this.icon, this.color);

  final String label;
  final String email;
  final IconData icon;
  final Color color;
}
