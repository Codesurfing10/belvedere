"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  imageUrl: string | null;
  inStock: boolean;
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

interface Cart {
  id: string;
  status: string;
  totalAmount: number;
  suggestedBy: string | null;
  items: CartItem[];
}

interface Reservation {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  property: { id: string; name: string; address: string };
  guest: { id: string; name: string; email: string };
  carts: Cart[];
  orders: Order[];
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export default function GuestReservationPage() {
  const params = useParams();
  const reservationId = params.reservationId as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [deliveryStart, setDeliveryStart] = useState("");
  const [deliveryEnd, setDeliveryEnd] = useState("");
  const [deliveryType, setDeliveryType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const [resRes, catRes, prodRes, cartRes] = await Promise.all([
        fetch(`/api/reservations/${reservationId}`),
        fetch("/api/catalog/categories"),
        fetch("/api/catalog"),
        fetch(`/api/carts?reservationId=${reservationId}`),
      ]);
      if (resRes.ok) setReservation(await resRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
      if (cartRes.ok) {
        const carts: Cart[] = await cartRes.json();
        const pending = carts.find((c) => c.status === "PENDING" || c.status === "SUGGESTED");
        if (pending) setCart(pending);
      }
      setLoading(false);
    }
    load();
  }, [reservationId]);

  function adjustQty(productId: string, delta: number) {
    setQuantities((prev) => {
      const cur = prev[productId] ?? 0;
      const next = Math.max(0, cur + delta);
      return { ...prev, [productId]: next };
    });
  }

  async function submitCart() {
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));
    if (items.length === 0) { setMessage("Add at least one item."); return; }
    const res = await fetch("/api/carts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId, items }),
    });
    if (res.ok) {
      const newCart = await res.json();
      setCart(newCart);
      setMessage("Cart saved!");
    } else {
      setMessage("Failed to save cart.");
    }
  }

  async function submitOrder() {
    if (!cart) { setMessage("No cart to submit."); return; }
    if (!deliveryStart || !deliveryEnd) { setMessage("Select delivery window."); return; }
    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartId: cart.id,
        deliveryWindow: {
          startTime: new Date(deliveryStart).toISOString(),
          endTime: new Date(deliveryEnd).toISOString(),
          type: deliveryType,
        },
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setMessage("Order placed successfully!");
      const updated = await fetch(`/api/reservations/${reservationId}`);
      if (updated.ok) setReservation(await updated.json());
    } else {
      const err = await res.json();
      setMessage(err.error || "Failed to place order.");
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!reservation) return <div className="p-8 text-center text-red-500">Reservation not found.</div>;

  const productsByCategory = categories.map((cat) => ({
    ...cat,
    products: products.filter((p) => p.category.id === cat.id && p.inStock),
  }));

  const suggestedCart = reservation.carts?.find((c) => c.status === "SUGGESTED");
  const approvedCart = reservation.carts?.find((c) => c.status === "APPROVED");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-indigo-50 rounded-xl p-6 mb-8">
        <h1 className="text-2xl font-bold text-indigo-800">{reservation.property.name}</h1>
        <p className="text-gray-600 mt-1">{reservation.property.address}</p>
        <div className="flex gap-6 mt-3 text-sm text-gray-700">
          <span>Check-in: <strong>{new Date(reservation.checkIn).toLocaleDateString()}</strong></span>
          <span>Check-out: <strong>{new Date(reservation.checkOut).toLocaleDateString()}</strong></span>
          <span>Status: <strong>{reservation.status}</strong></span>
        </div>
      </div>

      {suggestedCart && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-amber-800 mb-2">🤖 Suggested Cart (from host)</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            {suggestedCart.items.map((item) => (
              <li key={item.id}>{item.product.name} × {item.quantity} — ${(item.price * item.quantity).toFixed(2)}</li>
            ))}
          </ul>
          <p className="mt-2 font-semibold text-amber-700">Total: ${suggestedCart.totalAmount.toFixed(2)}</p>
        </div>
      )}

      {approvedCart && reservation.orders?.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-green-800 mb-2">✅ Approved Cart — Ready to Order</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            {approvedCart.items.map((item) => (
              <li key={item.id}>{item.product.name} × {item.quantity}</li>
            ))}
          </ul>
          <p className="mt-2 font-semibold text-green-700">Total: ${approvedCart.totalAmount.toFixed(2)}</p>
        </div>
      )}

      {reservation.orders && reservation.orders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-blue-800 mb-2">📦 Your Orders</h2>
          {reservation.orders.map((order) => (
            <div key={order.id} className="text-sm text-gray-700">
              Order #{order.id.slice(0, 8)} — <strong>{order.status}</strong> — ${order.totalAmount.toFixed(2)}
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Browse Catalog</h2>

      {productsByCategory.map((cat) =>
        cat.products.length === 0 ? null : (
          <div key={cat.id} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">{cat.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cat.products.map((product) => (
                <div key={product.id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.description}</p>
                    <p className="text-indigo-600 font-semibold mt-1">${product.price.toFixed(2)} / {product.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => adjustQty(product.id, -1)} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-lg font-bold leading-none">−</button>
                    <span className="w-6 text-center font-semibold">{quantities[product.id] ?? 0}</span>
                    <button onClick={() => adjustQty(product.id, 1)} className="w-7 h-7 rounded-full bg-indigo-100 hover:bg-indigo-200 text-lg font-bold leading-none">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      <div className="bg-white border rounded-xl p-6 mt-4">
        <h2 className="text-lg font-bold mb-4">Your Cart</h2>
        {Object.entries(quantities).filter(([, q]) => q > 0).length === 0 && !cart && (
          <p className="text-gray-400 text-sm">No items added yet.</p>
        )}
        {cart && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Saved cart (status: {cart.status}):</p>
            {cart.items.map((item) => (
              <div key={item.id} className="text-sm">{item.product.name} × {item.quantity}</div>
            ))}
            <p className="font-semibold mt-1">Total: ${cart.totalAmount.toFixed(2)}</p>
          </div>
        )}
        <button onClick={submitCart} className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 mr-3">
          Save Cart
        </button>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Delivery Window</h3>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input type="datetime-local" value={deliveryStart} onChange={(e) => setDeliveryStart(e.target.value)} className="border rounded px-3 py-2 text-sm" />
            <input type="datetime-local" value={deliveryEnd} onChange={(e) => setDeliveryEnd(e.target.value)} className="border rounded px-3 py-2 text-sm" />
            <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value as "DELIVERY" | "PICKUP")} className="border rounded px-3 py-2 text-sm">
              <option value="DELIVERY">Delivery</option>
              <option value="PICKUP">Pickup</option>
            </select>
          </div>
        </div>

        <button
          onClick={submitOrder}
          disabled={submitting || !cart}
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Order"}
        </button>
        {message && <p className="mt-3 text-sm text-indigo-700 font-medium">{message}</p>}
      </div>
    </div>
  );
}
