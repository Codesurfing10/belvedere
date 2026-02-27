class StatsKpis {
  const StatsKpis({
    required this.totalProperties,
    required this.totalReservations,
    required this.totalOrders,
    required this.avgRating,
  });

  final int totalProperties;
  final int totalReservations;
  final int totalOrders;
  final double avgRating;

  factory StatsKpis.fromJson(Map<String, dynamic> json) => StatsKpis(
        totalProperties: (json['totalProperties'] as num).toInt(),
        totalReservations: (json['totalReservations'] as num).toInt(),
        totalOrders: (json['totalOrders'] as num).toInt(),
        avgRating: (json['avgRating'] as num).toDouble(),
      );
}

class MonthDataPoint {
  const MonthDataPoint({required this.label, required this.value});

  final String label;
  final double value;
}

class CategoryDataPoint {
  const CategoryDataPoint({required this.name, required this.orders});

  final String name;
  final int orders;
}

class AppStats {
  const AppStats({
    required this.kpis,
    required this.monthlyReservations,
    required this.monthlyRevenue,
    required this.topCategories,
  });

  final StatsKpis kpis;
  final List<MonthDataPoint> monthlyReservations;
  final List<MonthDataPoint> monthlyRevenue;
  final List<CategoryDataPoint> topCategories;

  factory AppStats.fromJson(Map<String, dynamic> json) => AppStats(
        kpis: StatsKpis.fromJson(json['kpis'] as Map<String, dynamic>),
        monthlyReservations:
            (json['monthlyReservations'] as List<dynamic>)
                .map((e) {
                  final m = e as Map<String, dynamic>;
                  return MonthDataPoint(
                    label: m['month'] as String,
                    value: (m['count'] as num).toDouble(),
                  );
                })
                .toList(),
        monthlyRevenue: (json['monthlyRevenue'] as List<dynamic>)
            .map((e) {
              final m = e as Map<String, dynamic>;
              return MonthDataPoint(
                label: m['month'] as String,
                value: (m['amount'] as num).toDouble(),
              );
            })
            .toList(),
        topCategories: (json['topCategories'] as List<dynamic>)
            .map((e) {
              final m = e as Map<String, dynamic>;
              return CategoryDataPoint(
                name: m['name'] as String,
                orders: (m['orders'] as num).toInt(),
              );
            })
            .toList(),
      );
}
