export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateManagerReviewSchema } from "@/lib/zod-schemas";

export async function POST(req: NextRequest, { params }: { params: Promise<{ managerId: string }> }) {
  const { managerId } = await params;
  const body = await req.json();
  const parsed = CreateManagerReviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { reviewerId, rating, comment } = parsed.data;

  const manager = await prisma.propertyManager.findUnique({ where: { id: managerId } });
  if (!manager) return NextResponse.json({ error: "Manager not found" }, { status: 404 });

  const review = await prisma.$transaction(async (tx) => {
    const r = await tx.managerReview.create({
      data: { managerId, reviewerId, rating, comment },
    });
    const allReviews = await tx.managerReview.findMany({ where: { managerId } });
    const avgRating = allReviews.reduce((sum, rv) => sum + rv.rating, 0) / allReviews.length;
    await tx.propertyManager.update({
      where: { id: managerId },
      data: { rating: avgRating, reviewCount: allReviews.length },
    });
    return r;
  });

  return NextResponse.json(review, { status: 201 });
}
