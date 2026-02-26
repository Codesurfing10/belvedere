"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: { name: string };
}

interface TemplateItem {
  productId: string;
  quantity: number;
  required: boolean;
  product?: Product;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  items: (TemplateItem & { product: Product })[];
}

interface Reservation {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  guest: { name: string };
}

interface Property {
  id: string;
  name: string;
  address: string;
  description: string | null;
  autoApprove: boolean;
  reservations: Reservation[];
}

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.propertyId as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [agentMessages, setAgentMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const [propRes, tmplRes, prodRes] = await Promise.all([
        fetch(`/api/properties/${propertyId}`),
        fetch(`/api/properties/${propertyId}/inventory-template`),
        fetch("/api/catalog"),
      ]);
      if (propRes.ok) setProperty(await propRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
      if (tmplRes.ok) {
        const t: Template = await tmplRes.json();
        setTemplate(t);
        setTemplateName(t.name);
        setTemplateDesc(t.description ?? "");
        setItems(t.items.map((i) => ({ productId: i.productId, quantity: i.quantity, required: i.required })));
      }
      setLoading(false);
    }
    load();
  }, [propertyId]);

  function addItem() {
    if (products.length === 0) return;
    setItems((prev) => [...prev, { productId: products[0].id, quantity: 1, required: true }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof TemplateItem, value: string | number | boolean) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  async function saveTemplate() {
    setSaving(true);
    const res = await fetch(`/api/properties/${propertyId}/inventory-template`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: templateName, description: templateDesc, items }),
    });
    setSaving(false);
    if (res.ok) setMessage("Template saved!");
    else setMessage("Save failed.");
  }

  async function triggerAgent(reservationId: string) {
    setAgentMessages((prev) => ({ ...prev, [reservationId]: "Triggering..." }));
    const res = await fetch("/api/agents/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId }),
    });
    if (res.ok) {
      const data = await res.json();
      setAgentMessages((prev) => ({ ...prev, [reservationId]: `Job queued: ${data.jobId}` }));
    } else {
      setAgentMessages((prev) => ({ ...prev, [reservationId]: "Failed to trigger agent." }));
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!property) return <div className="p-8 text-center text-red-500">Property not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/owner" className="text-indigo-600 hover:underline text-sm">← Owner Dashboard</Link>

      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-bold">{property.name}</h1>
        <p className="text-gray-500 mt-1">{property.address}</p>
        {property.description && <p className="text-gray-700 mt-2">{property.description}</p>}
        <p className="text-sm mt-2 text-gray-400">Auto-approve: {property.autoApprove ? "✅ On" : "❌ Off"}</p>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Inventory Template</h2>
        <div className="bg-white border rounded-xl p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
            <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="border rounded px-3 py-2 w-full text-sm" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={templateDesc} onChange={(e) => setTemplateDesc(e.target.value)} className="border rounded px-3 py-2 w-full text-sm" rows={2} />
          </div>

          <h3 className="font-semibold text-gray-700 mb-2">Items</h3>
          <div className="space-y-2 mb-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <select
                  value={item.productId}
                  onChange={(e) => updateItem(index, "productId", e.target.value)}
                  className="border rounded px-2 py-1.5 text-sm flex-1"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (${p.price}/{p.unit})</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                  className="border rounded px-2 py-1.5 text-sm w-16"
                />
                <label className="flex items-center gap-1 text-sm">
                  <input type="checkbox" checked={item.required} onChange={(e) => updateItem(index, "required", e.target.checked)} />
                  Required
                </label>
                <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 text-sm px-2">✕</button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={addItem} className="border border-indigo-400 text-indigo-600 px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-50">
              + Add Item
            </button>
            <button onClick={saveTemplate} disabled={saving} className="bg-indigo-600 text-white px-5 py-1.5 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save Template"}
            </button>
          </div>
          {message && <p className="mt-3 text-sm text-green-700 font-medium">{message}</p>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Reservations</h2>
        {property.reservations.length === 0 ? (
          <p className="text-gray-400">No reservations yet.</p>
        ) : (
          <div className="space-y-3">
            {property.reservations.map((res) => (
              <div key={res.id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">Guest: {res.guest.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(res.checkIn).toLocaleDateString()} – {new Date(res.checkOut).toLocaleDateString()} ({res.status})
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => triggerAgent(res.id)}
                    className="bg-amber-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-amber-600"
                  >
                    Trigger Agent
                  </button>
                  {agentMessages[res.id] && (
                    <span className="text-xs text-gray-500">{agentMessages[res.id]}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
