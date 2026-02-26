export interface VendorProduct {
  vendorSku: string;
  name: string;
  price: number;
  inStock: boolean;
  leadTimeDays: number;
}

export async function checkVendorStock(productIds: string[]): Promise<Record<string, boolean>> {
  console.log(`[Vendor] Checking stock for ${productIds.length} products`);
  return Object.fromEntries(productIds.map((id) => [id, true]));
}

export async function submitVendorOrder(
  items: { productId: string; quantity: number }[]
): Promise<{ vendorOrderId: string; estimatedDelivery: Date }> {
  console.log(`[Vendor] Submitting order for ${items.length} items`);
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 2);
  return {
    vendorOrderId: `VO-${Date.now()}`,
    estimatedDelivery,
  };
}
