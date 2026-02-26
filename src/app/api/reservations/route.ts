import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateReservationSchema } from "@/lib/zod-schemas";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");
  const guestId = searchParams.get("guestId");

  const where: Record<string, string> = {};
  if (propertyId) where.propertyId = propertyId;
  if (guestId) where.guestId = guestId;

  const reservations = await prisma.reservation.findMany({
    where,
    include: {
      property: true,
      guest: { select: { id: true, name: true, email: true } },
    },
    orderBy: { checkIn: "asc" },
  });
  return NextResponse.json(reservations);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateReservationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const reservation = await prisma.reservation.create({
    data: {
      propertyId: parsed.data.propertyId,
      guestId: parsed.data.guestId,
      checkIn: new Date(parsed.data.checkIn),
      checkOut: new Date(parsed.data.checkOut),
    },
  });
  return NextResponse.json(reservation, { status: 201 });
}
