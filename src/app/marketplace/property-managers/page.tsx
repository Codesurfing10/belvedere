"use client";

import { useEffect, useState, useRef } from "react";
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

/** Matches a standalone 5-digit US zip code. */
const ZIP_RE = /^\d{5}$/;

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

/** Strip pure-zip entries so region pills show city labels, not raw zip codes. */
function displayRegions(regions: ServiceRegion[]): ServiceRegion[] {
  return regions.filter((r) => !ZIP_RE.test(r.region.trim()));
}

export default function PropertyManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [allRegions, setAllRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");

  // Zip code search state
  const [zipInput, setZipInput] = useState("");
  const [activeZip, setActiveZip] = useState("");
  const [zipError, setZipError] = useState("");

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch whenever activeZip or selectedRegion changes
  useEffect(() => {
    async function load() {
      setLoading(true);
      let url = "/api/property-managers";
      if (activeZip) {
        url += `?zipCode=${encodeURIComponent(activeZip)}`;
      } else if (selectedRegion) {
        url += `?region=${encodeURIComponent(selectedRegion)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data: Manager[] = await res.json();
        setManagers(data);
        // Rebuild region list from all managers (unfiltered)
        if (!activeZip && !selectedRegion) {
          const regions = Array.from(
            new Set(
              data.flatMap((m) =>
                m.serviceRegions
                  .map((r) => r.region)
                  .filter((r) => !/^\d{5}$/.test(r.trim()))
              )
            )
          ).sort();
          setAllRegions(regions);
        }
      }
      setLoading(false);
      setSearching(false);
    }
    load();
  }, [activeZip, selectedRegion]);

  function handleZipSearch(e: React.FormEvent) {
    e.preventDefault();
    const zip = zipInput.trim();
    if (!ZIP_RE.test(zip)) {
      setZipError("Please enter a valid 5-digit US zip code.");
      return;
    }
    setZipError("");
    setSelectedRegion("");
    setSearching(true);
    setActiveZip(zip);
  }

  function clearZip() {
    setZipInput("");
    setActiveZip("");
    setZipError("");
    inputRef.current?.focus();
  }

  function handleRegionChange(region: string) {
    setSelectedRegion(region);
    setActiveZip("");
    setZipInput("");
    setZipError("");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <Link href="/" className="text-indigo-600 hover:underline text-sm">← Home</Link>
        <h1 className="text-3xl font-bold mt-2">Property Manager Marketplace</h1>
        <p className="text-gray-500 mt-1">Find verified property managers near you</p>
      </div>

      {/* ── Zip code search module ── */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-indigo-900 mb-1 flex items-center gap-2">
          <span>📍</span> Find managers in your area
        </h2>
        <p className="text-sm text-indigo-700 mb-4">Enter your zip code to see who serves your location.</p>
        <form onSubmit={handleZipSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={zipInput}
              onChange={(e) => {
                setZipInput(e.target.value.replace(/\D/g, "").slice(0, 5));
                setZipError("");
              }}
              placeholder="Enter 5-digit zip code"
              aria-label="Zip code"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10 transition ${
                zipError ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
              }`}
            />
            {zipInput && (
              <button
                type="button"
                onClick={clearZip}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                aria-label="Clear zip code"
              >
                ×
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={searching}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition whitespace-nowrap"
          >
            {searching ? "Searching…" : "Search"}
          </button>
        </form>
        {zipError && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {zipError}
          </p>
        )}
        {activeZip && !loading && (
          <p className="mt-3 text-sm text-indigo-700 font-medium">
            {managers.length > 0
              ? `✅ ${managers.length} manager${managers.length === 1 ? "" : "s"} serving zip code ${activeZip}`
              : `No managers found for zip code ${activeZip}.`}
            <button onClick={clearZip} className="ml-3 text-xs text-indigo-500 hover:underline">
              Clear search
            </button>
          </p>
        )}
      </div>

      {/* ── Region dropdown (secondary filter) ── */}
      {!activeZip && (
        <div className="mb-6 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Or filter by region:
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">All Regions</option>
            {allRegions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      )}

      {/* ── Results ── */}
      {loading ? (
        <div className="py-16 text-center text-gray-400">
          <div className="inline-block w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3" />
          <p className="text-sm">Loading managers…</p>
        </div>
      ) : managers.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No managers found.</p>
          <p className="text-sm mt-1">
            {activeZip
              ? "Try a different zip code or browse all regions."
              : "No managers are registered yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {managers.map((manager) => (
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
                {displayRegions(manager.serviceRegions).map((r) => (
                  <span key={r.id} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full">
                    {r.region}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
