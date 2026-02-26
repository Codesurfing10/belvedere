export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateCartSchema } from "@/lib/zod-schemas";

export async function GET(_req: NextRequest, { params }: { params: { cartId: string } }) {
  const cart = await prisma.cart.findUnique({
    where: { id: params.cartId },
    include: { items: { include: { product: true } } },
  });
  if (!cart) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(cart);
}

export async function PUT(req: NextRequest, { params }: { params: { cartId: string } }) {
  const body = await req.json();
  const parsed = UpdateCartSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { items } = parsed.data;
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
  const totalAmount = items.reduce((sum, item) => {
    const product = productMap[item.productId];
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const cart = await prisma.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({ where: { cartId: params.cartId } });
    return tx.cart.update({
      where: { id: params.cartId },
      data: {
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
  });
  return NextResponse.json(cart);
}
