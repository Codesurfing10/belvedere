class Property {
  const Property({
    required this.id,
    required this.name,
    required this.address,
    required this.autoApprove,
    this.description,
  });

  final String id;
  final String name;
  final String address;
  final bool autoApprove;
  final String? description;

  factory Property.fromJson(Map<String, dynamic> json) => Property(
        id: json['id'] as String,
        name: json['name'] as String,
        address: json['address'] as String,
        autoApprove: (json['autoApprove'] as bool?) ?? false,
        description: json['description'] as String?,
      );
}
