import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api/api_client.dart';
import '../models/cart.dart';
import '../models/property.dart';
import '../providers/auth_provider.dart';

class OwnerDashboardScreen extends StatefulWidget {
  const OwnerDashboardScreen({super.key});

  @override
  State<OwnerDashboardScreen> createState() => _OwnerDashboardScreenState();
}

class _OwnerDashboardScreenState extends State<OwnerDashboardScreen> {
  List<Property> _properties = [];
  List<Cart> _suggestedCarts = [];
  bool _loading = true;
  String? _error;
  String? _message;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        ApiClient.instance.getList('/api/properties'),
        ApiClient.instance.getList(
          '/api/carts',
          queryParams: {'status': 'SUGGESTED'},
        ),
      ]);
      if (!mounted) return;
      setState(() {
        _properties = (results[0])
            .map((e) => Property.fromJson(e as Map<String, dynamic>))
            .toList();
        _suggestedCarts = (results[1])
            .map((e) => Cart.fromJson(e as Map<String, dynamic>))
            .toList();
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  Future<void> _handleCartAction(String cartId, String action) async {
    try {
      await ApiClient.instance
          .post('/api/carts/$cartId/approve', {'action': action});
      if (!mounted) return;
      setState(() {
        _message = 'Cart ${action}d successfully.';
        _suggestedCarts.removeWhere((c) => c.id == cartId);
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _message = 'Error: ${e.message}');
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    if (!auth.isAuthenticated) {
      return Scaffold(
        appBar: AppBar(title: const Text('Owner Dashboard')),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Sign in to access the Owner Dashboard.'),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: () => Navigator.pushNamed(context, '/signin'),
                child: const Text('Sign In'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Owner Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _load,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _ErrorView(error: _error!, onRetry: _load)
              : RefreshIndicator(
                  onRefresh: _load,
                  child: _buildContent(),
                ),
    );
  }

  Widget _buildContent() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (_message != null) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.green[50],
              border: Border.all(color: Colors.green.shade200),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(_message!, style: const TextStyle(color: Colors.green)),
          ),
          const SizedBox(height: 12),
        ],

        // Properties section
        const _SectionHeader(
          icon: Icons.home,
          title: 'Your Properties',
        ),
        const SizedBox(height: 8),
        if (_properties.isEmpty)
          const _EmptyState(message: 'No properties yet.')
        else
          ...(_properties.map((p) => _PropertyCard(property: p))),

        const SizedBox(height: 24),

        // Cart approvals section
        const _SectionHeader(
          icon: Icons.shopping_cart,
          title: 'Pending Cart Approvals',
        ),
        const SizedBox(height: 8),
        if (_suggestedCarts.isEmpty)
          const _EmptyState(message: 'No carts pending approval.')
        else
          ...(_suggestedCarts.map(
            (cart) => _CartCard(
              cart: cart,
              onApprove: () => _handleCartAction(cart.id, 'approve'),
              onReject: () => _handleCartAction(cart.id, 'reject'),
            ),
          )),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.icon, required this.title});

  final IconData icon;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Theme.of(context).colorScheme.primary),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Text(message, style: const TextStyle(color: Colors.grey)),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.error, required this.onRetry});

  final String error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline, size: 48, color: Colors.red),
          const SizedBox(height: 12),
          Text(error, textAlign: TextAlign.center),
          const SizedBox(height: 12),
          FilledButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}

class _PropertyCard extends StatelessWidget {
  const _PropertyCard({required this.property});

  final Property property;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: const CircleAvatar(child: Icon(Icons.home)),
        title: Text(property.name),
        subtitle: Text(property.address),
        trailing: Icon(
          property.autoApprove ? Icons.check_circle : Icons.cancel,
          color: property.autoApprove ? Colors.green : Colors.grey,
          size: 18,
        ),
      ),
    );
  }
}

class _CartCard extends StatelessWidget {
  const _CartCard({
    required this.cart,
    required this.onApprove,
    required this.onReject,
  });

  final Cart cart;
  final VoidCallback onApprove;
  final VoidCallback onReject;

  @override
  Widget build(BuildContext context) {
    final checkIn = _fmt(cart.reservation.checkIn);
    final checkOut = _fmt(cart.reservation.checkOut);

    return Card(
      color: Colors.amber[50],
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${cart.reservation.propertyName} — ${cart.reservation.guestName}',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            ),
            const SizedBox(height: 4),
            Text(
              '$checkIn – $checkOut',
              style: TextStyle(fontSize: 13, color: Colors.grey[600]),
            ),
            const SizedBox(height: 8),
            ...cart.items.map(
              (item) => Text(
                '• ${item.productName} × ${item.quantity}',
                style: const TextStyle(fontSize: 13),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Total: \$${cart.totalAmount.toStringAsFixed(2)}',
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: Colors.brown,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                FilledButton(
                  onPressed: onApprove,
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.green,
                  ),
                  child: const Text('Approve'),
                ),
                const SizedBox(width: 8),
                OutlinedButton(
                  onPressed: onReject,
                  style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                  child: const Text('Reject'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _fmt(DateTime dt) =>
      '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
}
