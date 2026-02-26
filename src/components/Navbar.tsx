"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  OWNER: "bg-indigo-100 text-indigo-700",
  MANAGER: "bg-green-100 text-green-700",
  GUEST: "bg-sky-100 text-sky-700",
};

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const role = (session?.user as { role?: string } | undefined)?.role ?? "";

  function navLink(href: string, label: string) {
    const active = pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={`text-sm font-medium transition-colors ${
          active ? "text-indigo-600" : "text-gray-600 hover:text-indigo-600"
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-extrabold text-indigo-600 tracking-tight shrink-0">
          Belvedere
        </Link>

        {/* Centre links */}
        <div className="hidden sm:flex items-center gap-6">
          {navLink("/owner", "Owner Portal")}
          {navLink("/marketplace/property-managers", "Marketplace")}
        </div>

        {/* Auth area */}
        <div className="flex items-center gap-2 shrink-0">
          {status === "loading" ? (
            <div className="w-20 h-7 bg-gray-100 rounded animate-pulse" />
          ) : session ? (
            <>
              <span className="hidden sm:block text-sm text-gray-600 max-w-[130px] truncate">
                {session.user?.name}
              </span>
              {role && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                    ROLE_BADGE[role] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {role}
                </span>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-700"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="text-sm px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
