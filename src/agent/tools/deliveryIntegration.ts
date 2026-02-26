export interface DeliverySlot {
  id: string;
  startTime: Date;
  endTime: Date;
  available: boolean;
}

export async function getAvailableDeliverySlots(
  address: string,
  date: Date
): Promise<DeliverySlot[]> {
  console.log(`[Delivery] Getting slots for ${address} on ${date.toISOString()}`);
  const slots: DeliverySlot[] = [];
  for (let h = 9; h <= 17; h += 2) {
    slots.push({
      id: `slot-${h}`,
      startTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), h),
      endTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), h + 2),
      available: true,
    });
  }
  return slots;
}

export async function scheduleDelivery(
  orderId: string,
  slotId: string,
  address: string
): Promise<{ trackingId: string }> {
  console.log(`[Delivery] Scheduling delivery for order ${orderId} at slot ${slotId} to ${address}`);
  return { trackingId: `TRACK-${orderId.slice(0, 8).toUpperCase()}` };
}
