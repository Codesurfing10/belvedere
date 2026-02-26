import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { reservationId: string } }) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: params.reservationId },
    include: {
      property: true,
      guest: { select: { id: true, name: true, email: true } },
      carts: { include: { items: { include: { product: true } } } },
      orders: true,
    },
  });
  if (!reservation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(reservation);
}
