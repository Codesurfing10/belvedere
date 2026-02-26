import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { propertyId: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.propertyId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      inventoryTemplate: { include: { items: { include: { product: true } } } },
      reservations: {
        include: { guest: { select: { id: true, name: true, email: true } } },
        orderBy: { checkIn: "asc" },
      },
    },
  });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(property);
}
