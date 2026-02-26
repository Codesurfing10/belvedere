import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateCartSchema } from "@/lib/zod-schemas";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reservationId = searchParams.get("reservationId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (reservationId) where.reservationId = reservationId;
  if (status) where.status = status;

  const carts = await prisma.cart.findMany({
    where,
    include: {
      items: { include: { product: true } },
      reservation: {
        include: {
          property: true,
          guest: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(carts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateCartSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { reservationId, items } = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  const totalAmount = items.reduce((sum, item) => {
    const product = productMap[item.productId];
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const cart = await prisma.cart.create({
    data: {
      reservationId,
      totalAmount,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: productMap[item.productId]?.price ?? 0,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });
  return NextResponse.json(cart, { status: 201 });
}
