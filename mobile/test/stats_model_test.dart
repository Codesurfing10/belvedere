import 'dart:convert';

import 'package:belvedere_mobile/models/stats.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('AppStats.fromJson', () {
    const raw = '''
{
  "kpis": {
    "totalProperties": 42,
    "totalReservations": 318,
    "totalOrders": 214,
    "avgRating": 4.6
  },
  "monthlyReservations": [
    {"month": "Jan", "count": 29},
    {"month": "Feb", "count": 34}
  ],
  "monthlyRevenue": [
    {"month": "Jan", "amount": 5400},
    {"month": "Feb", "amount": 6300}
  ],
  "topCategories": [
    {"name": "Toiletries", "orders": 87},
    {"name": "Linens", "orders": 64}
  ]
}
''';

    test('parses KPIs correctly', () {
      final stats = AppStats.fromJson(jsonDecode(raw) as Map<String, dynamic>);
      expect(stats.kpis.totalProperties, equals(42));
      expect(stats.kpis.totalReservations, equals(318));
      expect(stats.kpis.totalOrders, equals(214));
      expect(stats.kpis.avgRating, equals(4.6));
    });

    test('parses monthly reservations', () {
      final stats = AppStats.fromJson(jsonDecode(raw) as Map<String, dynamic>);
      expect(stats.monthlyReservations.length, equals(2));
      expect(stats.monthlyReservations.first.label, equals('Jan'));
      expect(stats.monthlyReservations.first.value, equals(29.0));
    });

    test('parses monthly revenue', () {
      final stats = AppStats.fromJson(jsonDecode(raw) as Map<String, dynamic>);
      expect(stats.monthlyRevenue.length, equals(2));
      expect(stats.monthlyRevenue.last.label, equals('Feb'));
      expect(stats.monthlyRevenue.last.value, equals(6300.0));
    });

    test('parses top categories', () {
      final stats = AppStats.fromJson(jsonDecode(raw) as Map<String, dynamic>);
      expect(stats.topCategories.length, equals(2));
      expect(stats.topCategories.first.name, equals('Toiletries'));
      expect(stats.topCategories.first.orders, equals(87));
    });
  });
}
