"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Property {
  id: string;
  name: string;
  address: string;
  autoApprove: boolean;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: { name: string };
}

interface Cart {
  id: string;
  status: string;
  totalAmount: number;
  suggestedBy: string | null;
  items: CartItem[];
  reservation: {
    id: string;
    checkIn: string;
    checkOut: string;
    property: { name: string };
    guest: { name: string };
  };
}

export default function OwnerDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [suggestedCarts, setSuggestedCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const [propRes, cartRes] = await Promise.all([
        fetch("/api/properties"),
        fetch("/api/carts?status=SUGGESTED"),
      ]);
      if (propRes.ok) setProperties(await propRes.json());
      if (cartRes.ok) setSuggestedCarts(await cartRes.json());
      setLoading(false);
    }
    load();
  }, []);

  async function handleCartAction(cartId: string, action: "approve" | "reject") {
    const res = await fetch(`/api/carts/${cartId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setMessage(`Cart ${action}d successfully.`);
      setSuggestedCarts((prev) => prev.filter((c) => c.id !== cartId));
    } else {
      setMessage("Action failed.");
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
        <Link href="/" className="text-indigo-600 hover:underline text-sm">← Home</Link>
      </div>

      {message && <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded">{message}</div>}

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Your Properties</h2>
        {properties.length === 0 ? (
          <p className="text-gray-400">No properties yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {properties.map((p) => (
              <Link key={p.id} href={`/owner/properties/${p.id}`} className="bg-white border rounded-xl p-5 hover:border-indigo-400 transition">
                <h3 className="font-bold text-lg">{p.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{p.address}</p>
                <p className="text-xs mt-2 text-gray-400">Auto-approve: {p.autoApprove ? "✅ On" : "❌ Off"}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Pending Cart Approvals</h2>
        {suggestedCarts.length === 0 ? (
          <p className="text-gray-400">No carts pending approval.</p>
        ) : (
          <div className="space-y-4">
            {suggestedCarts.map((cart) => (
              <div key={cart.id} className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{cart.reservation.property.name} — {cart.reservation.guest.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(cart.reservation.checkIn).toLocaleDateString()} – {new Date(cart.reservation.checkOut).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Suggested by: {cart.suggestedBy ?? "guest"}</p>
                    <ul className="mt-2 text-sm text-gray-700 space-y-0.5">
                      {cart.items.map((item) => (
                        <li key={item.id}>{item.product.name} × {item.quantity}</li>
                      ))}
                    </ul>
                    <p className="mt-2 font-semibold text-amber-700">Total: ${cart.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleCartAction(cart.id, "approve")}
                      className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleCartAction(cart.id, "reject")}
                      className="bg-red-100 text-red-700 px-4 py-1.5 rounded-lg text-sm hover:bg-red-200"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
