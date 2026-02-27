import 'package:flutter/material.dart';

import '../api/api_client.dart';
import '../models/property_manager.dart';

class ManagerDetailScreen extends StatefulWidget {
  const ManagerDetailScreen({super.key, required this.managerId});

  final String managerId;

  @override
  State<ManagerDetailScreen> createState() => _ManagerDetailScreenState();
}

class _ManagerDetailScreenState extends State<ManagerDetailScreen> {
  PropertyManager? _manager;
  bool _loading = true;
  String? _error;

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
      final data = await ApiClient.instance
          .get('/api/property-managers/${widget.managerId}');
      if (!mounted) return;
      setState(() {
        _manager = PropertyManager.fromJson(data);
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
      appBar: AppBar(
        title: Text(_manager?.userName ?? 'Manager Detail'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _ErrorView(error: _error!, onRetry: _load)
              : _buildContent(),
    );
  }

  Widget _buildContent() {
    final m = _manager!;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        // Header card
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor:
                          Theme.of(context).colorScheme.primaryContainer,
                      child: Text(
                        (m.userName ?? '?').substring(0, 1).toUpperCase(),
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.onPrimaryContainer,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            m.userName ?? 'Unknown',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (m.userEmail != null)
                            Text(
                              m.userEmail!,
                              style: const TextStyle(
                                  color: Colors.grey, fontSize: 13),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Rating
                Row(
                  children: [
                    ...List.generate(5, (i) {
                      final filled = i < m.rating.round();
                      return Icon(
                        filled ? Icons.star : Icons.star_border,
                        color: Colors.amber,
                        size: 20,
                      );
                    }),
                    const SizedBox(width: 8),
                    Text(
                      '${m.rating.toStringAsFixed(1)} (${m.reviewCount} reviews)',
                      style: const TextStyle(fontSize: 14),
                    ),
                  ],
                ),
                if (m.bio != null && m.bio!.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text(m.bio!, style: const TextStyle(fontSize: 14)),
                ],
                if (m.regions.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  const Text(
                    'Service Regions',
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.grey),
                  ),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: m.regions
                        .map(
                          (r) => Chip(
                            label: Text(r.region, style: const TextStyle(fontSize: 12)),
                            materialTapTargetSize:
                                MaterialTapTargetSize.shrinkWrap,
                            padding: EdgeInsets.zero,
                          ),
                        )
                        .toList(),
                  ),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),

        // Reviews
        if (m.reviews.isNotEmpty) ...[
          const Text(
            'Reviews',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          ...m.reviews.map((r) => _ReviewCard(review: r)),
        ] else
          const Text(
            'No reviews yet.',
            style: TextStyle(color: Colors.grey),
          ),
      ],
    );
  }
}

class _ReviewCard extends StatelessWidget {
  const _ReviewCard({required this.review});

  final ManagerReview review;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                ...List.generate(5, (i) {
                  return Icon(
                    i < review.rating ? Icons.star : Icons.star_border,
                    size: 15,
                    color: Colors.amber,
                  );
                }),
                const SizedBox(width: 8),
                Text(
                  review.reviewerName ?? 'Anonymous',
                  style: const TextStyle(
                      fontSize: 13, fontWeight: FontWeight.w600),
                ),
                const Spacer(),
                Text(
                  _fmt(review.createdAt),
                  style: const TextStyle(fontSize: 11, color: Colors.grey),
                ),
              ],
            ),
            if (review.comment != null && review.comment!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(review.comment!, style: const TextStyle(fontSize: 13)),
            ],
          ],
        ),
      ),
    );
  }

  String _fmt(DateTime dt) =>
      '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
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
