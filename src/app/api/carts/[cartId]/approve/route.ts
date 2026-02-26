export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApproveCartSchema } from "@/lib/zod-schemas";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ cartId: string }> }) {
  const { cartId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ApproveCartSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { action } = parsed.data;
  const userId = (session.user as { id: string }).id;

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { reservation: { include: { property: true } } },
  });
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

  // Ensure only the property owner can approve/reject carts
  if (cart.reservation.property.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden: only the property owner can approve carts" }, { status: 403 });
  }

  const newStatus = action === "approve" ? "APPROVED" : "REJECTED";
  const updatedCart = await prisma.cart.update({
    where: { id: cartId },
    data: { status: newStatus },
  });

  await prisma.agentAuditLog.create({
    data: {
      reservationId: cart.reservationId,
      action: `cart_${action}d`,
      details: { cartId, action, userId },
      triggeredBy: userId,
    },
  });

  return NextResponse.json(updatedCart);
}
