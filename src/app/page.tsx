import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero */}
      <section className="flex-1 max-w-4xl mx-auto w-full px-6 py-24 text-center">
        <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
          Vacation Rental Platform
        </span>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          Pre-Arrival Supply Ordering<br className="hidden sm:block" /> for Vacation Rentals
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Let guests customize their stay before they arrive. Owners control inventory templates,
          approve carts, and connect with top property managers—all in one place.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
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

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto w-full px-6 pb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span className="font-bold text-indigo-600 text-base">Belvedere</span>
          <div className="flex gap-6">
            <Link href="/owner" className="hover:text-indigo-600 transition">Owner Portal</Link>
            <Link href="/marketplace/property-managers" className="hover:text-indigo-600 transition">Marketplace</Link>
            <Link href="/auth/signin" className="hover:text-indigo-600 transition">Sign In</Link>
          </div>
          <span>© {new Date().getFullYear()} Belvedere</span>
        </div>
      </footer>
    </div>
  );
}
