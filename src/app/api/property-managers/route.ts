export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ZIP_CODE_RE = /^\d{5}$/;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");
  const rawZip = searchParams.get("zipCode");
  const zipCode = rawZip && ZIP_CODE_RE.test(rawZip.trim()) ? rawZip.trim() : null;

  const managers = await prisma.propertyManager.findMany({
    where: zipCode
      ? { serviceRegions: { some: { region: { contains: zipCode, mode: "insensitive" } } } }
      : region
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
