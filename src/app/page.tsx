import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="text-2xl font-bold text-indigo-600">Belvedere</span>
        <div className="flex gap-6">
          <Link href="/owner" className="text-gray-600 hover:text-indigo-600 font-medium">
            Owner Portal
          </Link>
          <Link href="/marketplace/property-managers" className="text-gray-600 hover:text-indigo-600 font-medium">
            Marketplace
          </Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
          Pre-Arrival Supply Ordering for Vacation Rentals
        </h1>
        <p className="text-xl text-gray-500 mb-10">
          Let guests customize their stay before they arrive. Owners control inventory templates,
          approve carts, and connect with top property managers—all in one place.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/owner"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Owner Dashboard
          </Link>
          <Link
            href="/marketplace/property-managers"
            className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
          >
            Find a Manager
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-indigo-50 rounded-xl p-8">
          <div className="text-4xl mb-4">🛒</div>
          <h3 className="text-lg font-bold mb-2">Guest Ordering</h3>
          <p className="text-gray-600 text-sm">
            Guests browse a curated catalog and request supplies—from toiletries to kayaks—before
            check-in day.
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-8">
          <div className="text-4xl mb-4">🏠</div>
          <h3 className="text-lg font-bold mb-2">Owner Dashboard</h3>
          <p className="text-gray-600 text-sm">
            Owners define inventory templates per property, enable auto-approval, and review
            AI-suggested supply carts.
          </p>
        </div>
        <div className="bg-amber-50 rounded-xl p-8">
          <div className="text-4xl mb-4">⭐</div>
          <h3 className="text-lg font-bold mb-2">Manager Marketplace</h3>
          <p className="text-gray-600 text-sm">
            Browse verified property managers by region, read reviews, and hire the best fit for your
            rental.
          </p>
        </div>
      </section>
    </div>
  );
}
