export function generateStaticParams() { return []; }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
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
