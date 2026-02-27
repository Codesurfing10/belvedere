class CartItem {
  const CartItem({
    required this.id,
    required this.quantity,
    required this.price,
    required this.productName,
  });

  final String id;
  final int quantity;
  final double price;
  final String productName;

  factory CartItem.fromJson(Map<String, dynamic> json) {
    final product = json['product'] as Map<String, dynamic>? ?? {};
    return CartItem(
      id: json['id'] as String,
      quantity: json['quantity'] as int,
      price: (json['price'] as num).toDouble(),
      productName: (product['name'] as String?) ?? 'Unknown',
    );
  }
}

class CartReservation {
  const CartReservation({
    required this.id,
    required this.checkIn,
    required this.checkOut,
    required this.propertyName,
    required this.guestName,
  });

  final String id;
  final DateTime checkIn;
  final DateTime checkOut;
  final String propertyName;
  final String guestName;

  factory CartReservation.fromJson(Map<String, dynamic> json) {
    final property = json['property'] as Map<String, dynamic>? ?? {};
    final guest = json['guest'] as Map<String, dynamic>? ?? {};
    return CartReservation(
      id: json['id'] as String,
      checkIn: DateTime.parse(json['checkIn'] as String),
      checkOut: DateTime.parse(json['checkOut'] as String),
      propertyName: (property['name'] as String?) ?? '',
      guestName: (guest['name'] as String?) ?? '',
    );
  }
}

class Cart {
  const Cart({
    required this.id,
    required this.status,
    required this.totalAmount,
    required this.items,
    required this.reservation,
    this.suggestedBy,
  });

  final String id;
  final String status;
  final double totalAmount;
  final List<CartItem> items;
  final CartReservation reservation;
  final String? suggestedBy;

  factory Cart.fromJson(Map<String, dynamic> json) => Cart(
        id: json['id'] as String,
        status: json['status'] as String,
        totalAmount: (json['totalAmount'] as num).toDouble(),
        suggestedBy: json['suggestedBy'] as String?,
        items: (json['items'] as List<dynamic>? ?? [])
            .map((e) => CartItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        reservation: CartReservation.fromJson(
          json['reservation'] as Map<String, dynamic>,
        ),
      );
}
