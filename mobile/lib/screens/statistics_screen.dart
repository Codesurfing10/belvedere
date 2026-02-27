import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../models/stats.dart';

class StatisticsScreen extends StatefulWidget {
  const StatisticsScreen({super.key});

  @override
  State<StatisticsScreen> createState() => _StatisticsScreenState();
}

class _StatisticsScreenState extends State<StatisticsScreen> {
  AppStats? _stats;
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
      final raw = await rootBundle.loadString('assets/stats.json');
      final json = jsonDecode(raw) as Map<String, dynamic>;
      if (!mounted) return;
      setState(() {
        _stats = AppStats.fromJson(json);
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Statistics')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : RefreshIndicator(
                  onRefresh: _load,
                  child: _buildContent(),
                ),
    );
  }

  Widget _buildContent() {
    final stats = _stats!;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // KPI cards
        const _SectionTitle('Key Performance Indicators'),
        const SizedBox(height: 8),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.5,
          children: [
            _KpiCard(
              label: 'Total Properties',
              value: stats.kpis.totalProperties.toString(),
              icon: Icons.home,
              color: const Color(0xFF1A3A5C),
            ),
            _KpiCard(
              label: 'Total Reservations',
              value: stats.kpis.totalReservations.toString(),
              icon: Icons.event,
              color: const Color(0xFF2E7D32),
            ),
            _KpiCard(
              label: 'Total Orders',
              value: stats.kpis.totalOrders.toString(),
              icon: Icons.shopping_bag,
              color: const Color(0xFF1565C0),
            ),
            _KpiCard(
              label: 'Avg Manager Rating',
              value: stats.kpis.avgRating.toStringAsFixed(1),
              icon: Icons.star,
              color: const Color(0xFF6A1B9A),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Monthly reservations bar chart
        const _SectionTitle('Monthly Reservations'),
        const SizedBox(height: 8),
        _BarChart(
          data: stats.monthlyReservations,
          barColor: const Color(0xFF1A3A5C),
          valueFormatter: (v) => v.toInt().toString(),
        ),
        const SizedBox(height: 24),

        // Monthly revenue bar chart
        const _SectionTitle('Monthly Revenue (\$)'),
        const SizedBox(height: 8),
        _BarChart(
          data: stats.monthlyRevenue,
          barColor: const Color(0xFF2E7D32),
          valueFormatter: (v) => '\$${(v / 1000).toStringAsFixed(1)}k',
        ),
        const SizedBox(height: 24),

        // Top categories horizontal bar chart
        const _SectionTitle('Top Supply Categories'),
        const SizedBox(height: 8),
        _HorizontalBarChart(
          data: stats.topCategories
              .map((c) => MonthDataPoint(
                    label: c.name,
                    value: c.orders.toDouble(),
                  ))
              .toList(),
          barColor: const Color(0xFF6A1B9A),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// UI components
// ---------------------------------------------------------------------------

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
    );
  }
}

class _KpiCard extends StatelessWidget {
  const _KpiCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 22),
            const Spacer(),
            Text(
              value,
              style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: color),
            ),
            Text(
              label,
              style: const TextStyle(fontSize: 11, color: Colors.grey),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

/// Simple vertical bar chart drawn with CustomPainter.
class _BarChart extends StatelessWidget {
  const _BarChart({
    required this.data,
    required this.barColor,
    required this.valueFormatter,
  });

  final List<MonthDataPoint> data;
  final Color barColor;
  final String Function(double) valueFormatter;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 180,
      child: CustomPaint(
        painter: _BarChartPainter(
          data: data,
          barColor: barColor,
          labelStyle: TextStyle(
            color: Colors.grey[600],
            fontSize: 10,
          ),
        ),
        child: const SizedBox.expand(),
      ),
    );
  }
}

class _BarChartPainter extends CustomPainter {
  _BarChartPainter({
    required this.data,
    required this.barColor,
    required this.labelStyle,
  });

  final List<MonthDataPoint> data;
  final Color barColor;
  final TextStyle labelStyle;

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;

    const double bottomPad = 20.0;
    const double topPad = 10.0;
    final double chartH = size.height - bottomPad - topPad;

    final maxVal = data.map((d) => d.value).reduce((a, b) => a > b ? a : b);
    if (maxVal == 0) return;

    final barWidth = size.width / data.length;
    const double barPadRatio = 0.25;

    final barPaint = Paint()..color = barColor;

    for (var i = 0; i < data.length; i++) {
      final barH = (data[i].value / maxVal) * chartH;
      final left = i * barWidth + barWidth * barPadRatio / 2;
      final right = (i + 1) * barWidth - barWidth * barPadRatio / 2;
      final top = topPad + (chartH - barH);
      final bottom = topPad + chartH;

      canvas.drawRRect(
        RRect.fromLTRBR(
          left,
          top,
          right,
          bottom,
          const Radius.circular(3),
        ),
        barPaint,
      );

      // Label
      final span = TextSpan(text: data[i].label, style: labelStyle);
      final tp = TextPainter(
        text: span,
        textDirection: TextDirection.ltr,
      )..layout(maxWidth: barWidth);
      tp.paint(
        canvas,
        Offset(
          i * barWidth + (barWidth - tp.width) / 2,
          size.height - bottomPad + 2,
        ),
      );
    }
  }

  @override
  bool shouldRepaint(_BarChartPainter old) => old.data != data;
}

/// Simple horizontal bar chart.
class _HorizontalBarChart extends StatelessWidget {
  const _HorizontalBarChart({
    required this.data,
    required this.barColor,
  });

  final List<MonthDataPoint> data;
  final Color barColor;

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) return const SizedBox.shrink();
    final maxVal = data.map((d) => d.value).reduce((a, b) => a > b ? a : b);

    return Column(
      children: data.map((item) {
        final fraction = maxVal > 0 ? item.value / maxVal : 0.0;
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Row(
            children: [
              SizedBox(
                width: 90,
                child: Text(
                  item.label,
                  style: const TextStyle(fontSize: 13),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Expanded(
                child: LayoutBuilder(
                  builder: (_, constraints) => Stack(
                    children: [
                      Container(
                        height: 22,
                        decoration: BoxDecoration(
                          color: Colors.grey[200],
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      Container(
                        height: 22,
                        width: constraints.maxWidth * fraction,
                        decoration: BoxDecoration(
                          color: barColor.withValues(alpha: 0.8),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                item.value.toInt().toString(),
                style: const TextStyle(
                    fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
