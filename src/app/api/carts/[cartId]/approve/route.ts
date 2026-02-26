import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApproveCartSchema } from "@/lib/zod-schemas";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { cartId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ApproveCartSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { action } = parsed.data;
  const userId = (session.user as { id: string }).id;

  const cart = await prisma.cart.findUnique({
    where: { id: params.cartId },
    include: { reservation: true },
  });
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

  const newStatus = action === "approve" ? "APPROVED" : "REJECTED";
  const updatedCart = await prisma.cart.update({
    where: { id: params.cartId },
    data: { status: newStatus },
  });

  await prisma.agentAuditLog.create({
    data: {
      reservationId: cart.reservationId,
      action: `cart_${action}d`,
      details: { cartId: params.cartId, action, userId },
      triggeredBy: userId,
    },
  });

  return NextResponse.json(updatedCart);
}
