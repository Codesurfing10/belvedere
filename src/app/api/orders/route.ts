import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateOrderSchema } from "@/lib/zod-schemas";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reservationId = searchParams.get("reservationId");

  const orders = await prisma.order.findMany({
    where: reservationId ? { reservationId } : undefined,
    include: {
      cart: { include: { items: { include: { product: true } } } },
      deliveryWindow: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { cartId, deliveryWindow } = parsed.data;

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { reservation: { include: { property: true } } },
  });
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

  const property = cart.reservation.property;
  const requiresApproval = !property.autoApprove;

  if (requiresApproval && cart.status !== "APPROVED") {
    return NextResponse.json({ error: "Cart must be approved by the owner before ordering" }, { status: 400 });
  }
  if (!requiresApproval && cart.status !== "APPROVED" && cart.status !== "PENDING" && cart.status !== "SUGGESTED") {
    return NextResponse.json({ error: "Cart is not in a valid state for ordering" }, { status: 400 });
  }

  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        cartId,
        reservationId: cart.reservationId,
        totalAmount: cart.totalAmount,
        status: "CONFIRMED",
        deliveryWindow: {
          create: {
            startTime: new Date(deliveryWindow.startTime),
            endTime: new Date(deliveryWindow.endTime),
            type: deliveryWindow.type,
            location: deliveryWindow.location,
          },
        },
      },
      include: { deliveryWindow: true },
    });
    await tx.cart.update({ where: { id: cartId }, data: { status: "APPROVED" } });
    return o;
  });

  return NextResponse.json(order, { status: 201 });
}
