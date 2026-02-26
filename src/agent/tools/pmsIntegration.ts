export interface PMSReservation {
  externalId: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  propertyExternalId: string;
}

export async function fetchPMSReservations(propertyId: string): Promise<PMSReservation[]> {
  console.log(`[PMS] Fetching reservations for property ${propertyId}`);
  return [];
}

export async function syncPMSCalendar(propertyId: string): Promise<{ synced: number }> {
  console.log(`[PMS] Syncing calendar for property ${propertyId}`);
  return { synced: 0 };
}
