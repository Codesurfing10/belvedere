import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Belvedere – Pre-Arrival Supply Ordering",
  description: "Rental property inventory and guest pre-arrival supply ordering platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 font-sans">{children}</body>
    </html>
  );
}
