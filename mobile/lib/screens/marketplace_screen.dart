import 'package:flutter/material.dart';

import '../api/api_client.dart';
import '../models/property_manager.dart';
import 'manager_detail_screen.dart';

class MarketplaceScreen extends StatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  State<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends State<MarketplaceScreen> {
  List<PropertyManager> _managers = [];
  bool _loading = true;
  String? _error;

  final _filterController = TextEditingController();
  String _filterType = 'region'; // 'region' | 'zipCode'

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _filterController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    final filter = _filterController.text.trim();
    final params = <String, String>{};
    if (filter.isNotEmpty) params[_filterType] = filter;

    try {
      final list =
          await ApiClient.instance.getList('/api/property-managers', queryParams: params);
      if (!mounted) return;
      setState(() {
        _managers = list
            .map((e) => PropertyManager.fromJson(e as Map<String, dynamic>))
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Marketplace')),
      body: Column(
        children: [
          // Filter bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Row(
              children: [
                // Filter type toggle
                SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(value: 'region', label: Text('Region')),
                    ButtonSegment(value: 'zipCode', label: Text('ZIP')),
                  ],
                  selected: {_filterType},
                  onSelectionChanged: (sel) =>
                      setState(() => _filterType = sel.first),
                  style: const ButtonStyle(
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _filterController,
                    decoration: InputDecoration(
                      hintText: _filterType == 'zipCode'
                          ? '12345'
                          : 'e.g. Miami Beach',
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 10),
                      border: const OutlineInputBorder(),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.search, size: 20),
                        onPressed: _load,
                      ),
                    ),
                    onSubmitted: (_) => _load(),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          // Content
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? _ErrorView(error: _error!, onRetry: _load)
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: _buildList(),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildList() {
    if (_managers.isEmpty) {
      return const Center(child: Text('No property managers found.'));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _managers.length,
      itemBuilder: (_, i) => _ManagerCard(
        manager: _managers[i],
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute<void>(
            builder: (_) =>
                ManagerDetailScreen(managerId: _managers[i].id),
          ),
        ),
      ),
    );
  }
}

class _ManagerCard extends StatelessWidget {
  const _ManagerCard({required this.manager, required this.onTap});

  final PropertyManager manager;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final regionText = manager.regions.map((r) => r.region).join(', ');

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor:
              Theme.of(context).colorScheme.primaryContainer,
          child: Text(
            (manager.userName ?? '?').substring(0, 1).toUpperCase(),
            style: TextStyle(
              color: Theme.of(context).colorScheme.onPrimaryContainer,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        title: Text(
          manager.userName ?? 'Unknown Manager',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (regionText.isNotEmpty)
              Text(
                regionText,
                style: const TextStyle(fontSize: 12),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            Row(
              children: [
                const Icon(Icons.star, size: 14, color: Colors.amber),
                const SizedBox(width: 2),
                Text(
                  manager.rating.toStringAsFixed(1),
                  style: const TextStyle(fontSize: 12),
                ),
                const SizedBox(width: 4),
                Text(
                  '(${manager.reviewCount} reviews)',
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
          ],
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
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
