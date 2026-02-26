import PropertyDetailClient from "./PropertyDetailClient";

// Dummy param so Next.js accepts the static export; real routing is client-side.
export function generateStaticParams(): { propertyId: string }[] {
  return [{ propertyId: "_" }];
}

export default function PropertyDetailPage() {
  return <PropertyDetailClient />;
}
