import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/agent/auditLog";

interface GapItem {
  productId: string;
  productName: string;
  requiredQuantity: number;
  existingQuantity: number;
  gapQuantity: number;
}

interface AnalysisResult {
  cartId: string;
  gaps: GapItem[];
  itemsAdded: number;
}

export async function runInventoryGapAnalysis(reservationId: string): Promise<AnalysisResult> {
  await createAuditLog({
    reservationId,
    action: "gap_analysis_started",
    details: { reservationId },
    triggeredBy: "agent",
  });

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      property: {
        include: {
          inventoryTemplate: {
            include: { items: { include: { product: true } } },
          },
        },
      },
      carts: {
        where: { status: { in: ["PENDING", "SUGGESTED", "APPROVED"] } },
        include: { items: true },
      },
    },
  });

  if (!reservation) throw new Error(`Reservation ${reservationId} not found`);

  const template = reservation.property.inventoryTemplate;
  if (!template || template.items.length === 0) {
    await createAuditLog({
      reservationId,
      action: "gap_analysis_skipped",
      details: { reason: "No inventory template found" },
      triggeredBy: "agent",
    });
    const emptyCart = await prisma.cart.create({
      data: { reservationId, status: "SUGGESTED", suggestedBy: "agent", totalAmount: 0 },
    });
    return { cartId: emptyCart.id, gaps: [], itemsAdded: 0 };
  }

  const existingQuantities: Record<string, number> = {};
  for (const cart of reservation.carts) {
    for (const item of cart.items) {
      existingQuantities[item.productId] = (existingQuantities[item.productId] ?? 0) + item.quantity;
    }
  }

  const gaps: GapItem[] = [];
  for (const tmplItem of template.items) {
    if (!tmplItem.required) continue;
    const existing = existingQuantities[tmplItem.productId] ?? 0;
    const gap = tmplItem.quantity - existing;
    if (gap > 0) {
      gaps.push({
        productId: tmplItem.productId,
        productName: tmplItem.product.name,
        requiredQuantity: tmplItem.quantity,
        existingQuantity: existing,
        gapQuantity: gap,
      });
    }
  }

  await createAuditLog({
    reservationId,
    action: "gap_analysis_gaps_identified",
    details: { gapCount: gaps.length, gaps },
    triggeredBy: "agent",
  });

  const products = await prisma.product.findMany({
    where: { id: { in: gaps.map((g) => g.productId) }, inStock: true },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  const availableGaps = gaps.filter((g) => productMap[g.productId]);
  const totalAmount = availableGaps.reduce((sum, gap) => {
    const product = productMap[gap.productId];
    return sum + (product ? product.price * gap.gapQuantity : 0);
  }, 0);

  const cart = await prisma.cart.create({
    data: {
      reservationId,
      status: "SUGGESTED",
      suggestedBy: "agent",
      totalAmount,
      items: {
        create: availableGaps.map((gap) => ({
          productId: gap.productId,
          quantity: gap.gapQuantity,
          price: productMap[gap.productId]?.price ?? 0,
        })),
      },
    },
  });

  await createAuditLog({
    reservationId,
    action: "gap_analysis_cart_created",
    details: { cartId: cart.id, itemsAdded: availableGaps.length, totalAmount },
    triggeredBy: "agent",
  });

  return { cartId: cart.id, gaps, itemsAdded: availableGaps.length };
}
