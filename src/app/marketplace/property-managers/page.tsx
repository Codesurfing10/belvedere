"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ServiceRegion {
  id: string;
  region: string;
}

interface Manager {
  id: string;
  bio: string | null;
  rating: number;
  reviewCount: number;
  user: { id: string; name: string; email: string };
  serviceRegions: ServiceRegion[];
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="text-amber-400 text-lg">
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(Math.max(0, 5 - full - (half ? 1 : 0)))}
      <span className="text-gray-600 text-sm ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function PropertyManagersPage() {
  const [filtered, setFiltered] = useState<Manager[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const url = selectedRegion ? `/api/property-managers?region=${encodeURIComponent(selectedRegion)}` : "/api/property-managers";
      const res = await fetch(url);
      if (res.ok) {
        const data: Manager[] = await res.json();
        setFiltered(data);
        const allRegions = Array.from(new Set(data.flatMap((m) => m.serviceRegions.map((r) => r.region))));
        setRegions(allRegions);
      }
      setLoading(false);
    }
    load();
  }, [selectedRegion]);

  function filterByRegion(region: string) {
    setSelectedRegion(region);
    // selectedRegion change triggers useEffect which re-fetches with the region filter
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/" className="text-indigo-600 hover:underline text-sm">← Home</Link>
          <h1 className="text-3xl font-bold mt-2">Property Manager Marketplace</h1>
          <p className="text-gray-500 mt-1">Find verified property managers by region</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Filter by Region:</label>
        <select
          value={selectedRegion}
          onChange={(e) => filterByRegion(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400">No managers found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((manager) => (
            <div key={manager.id} className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">{manager.user.name}</h3>
                  <p className="text-sm text-gray-500">{manager.user.email}</p>
                </div>
                <div className="text-right">
                  <StarRating rating={manager.rating} />
                  <p className="text-xs text-gray-400 mt-0.5">{manager.reviewCount} reviews</p>
                </div>
              </div>
              {manager.bio && <p className="text-gray-600 text-sm mt-3">{manager.bio}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {manager.serviceRegions.map((r) => (
                  <span key={r.id} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full">{r.region}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
