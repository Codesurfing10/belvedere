class ServiceRegion {
  const ServiceRegion({required this.id, required this.region});

  final String id;
  final String region;

  factory ServiceRegion.fromJson(Map<String, dynamic> json) => ServiceRegion(
        id: json['id'] as String,
        region: json['region'] as String,
      );
}

class ManagerReview {
  const ManagerReview({
    required this.id,
    required this.rating,
    required this.createdAt,
    this.comment,
    this.reviewerName,
  });

  final String id;
  final int rating;
  final DateTime createdAt;
  final String? comment;
  final String? reviewerName;

  factory ManagerReview.fromJson(Map<String, dynamic> json) {
    final reviewer = json['reviewer'] as Map<String, dynamic>? ?? {};
    return ManagerReview(
      id: json['id'] as String,
      rating: json['rating'] as int,
      createdAt: DateTime.parse(json['createdAt'] as String),
      comment: json['comment'] as String?,
      reviewerName: reviewer['name'] as String?,
    );
  }
}

class PropertyManager {
  const PropertyManager({
    required this.id,
    required this.rating,
    required this.reviewCount,
    required this.regions,
    required this.reviews,
    this.bio,
    this.userName,
    this.userEmail,
  });

  final String id;
  final double rating;
  final int reviewCount;
  final List<ServiceRegion> regions;
  final List<ManagerReview> reviews;
  final String? bio;
  final String? userName;
  final String? userEmail;

  factory PropertyManager.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>? ?? {};
    return PropertyManager(
      id: json['id'] as String,
      rating: (json['rating'] as num).toDouble(),
      reviewCount: (json['reviewCount'] as int?) ?? 0,
      bio: json['bio'] as String?,
      userName: user['name'] as String?,
      userEmail: user['email'] as String?,
      regions: (json['serviceRegions'] as List<dynamic>? ?? [])
          .map((e) => ServiceRegion.fromJson(e as Map<String, dynamic>))
          .toList(),
      reviews: (json['reviews'] as List<dynamic>? ?? [])
          .map((e) => ManagerReview.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
