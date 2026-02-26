import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreatePropertySchema } from "@/lib/zod-schemas";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const properties = await prisma.property.findMany({
    include: { owner: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(properties);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { id: string; role: string };
  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const parsed = CreatePropertySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const property = await prisma.property.create({
    data: { ...parsed.data, ownerId: user.id },
  });
  return NextResponse.json(property, { status: 201 });
}
