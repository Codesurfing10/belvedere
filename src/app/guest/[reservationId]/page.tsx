import GuestReservationClient from "./GuestReservationClient";

// Empty params = no pages generated at build time;
// client-side routing still works for all IDs.
export async function generateStaticParams() {
  return [{ reservationId: "_" }];
}

export default function GuestReservationPage() {
  return <GuestReservationClient />;
}
