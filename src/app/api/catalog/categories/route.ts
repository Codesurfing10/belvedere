import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.catalogCategory.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}
