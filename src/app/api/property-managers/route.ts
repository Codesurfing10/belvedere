import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");

  const managers = await prisma.propertyManager.findMany({
    where: region
      ? { serviceRegions: { some: { region } } }
      : undefined,
    include: {
      user: { select: { id: true, name: true, email: true } },
      serviceRegions: true,
    },
    orderBy: { rating: "desc" },
  });
  return NextResponse.json(managers);
}
