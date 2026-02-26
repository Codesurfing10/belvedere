import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { managerId: string } }) {
  const manager = await prisma.propertyManager.findUnique({
    where: { id: params.managerId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      serviceRegions: true,
      reviews: {
        include: { reviewer: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!manager) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(manager);
}
