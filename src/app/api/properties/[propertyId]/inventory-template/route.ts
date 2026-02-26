import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateInventoryTemplateSchema } from "@/lib/zod-schemas";

export async function GET(_req: NextRequest, { params }: { params: { propertyId: string } }) {
  const template = await prisma.inventoryTemplate.findUnique({
    where: { propertyId: params.propertyId },
    include: { items: { include: { product: { include: { category: true } } } } },
  });
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(template);
}

export async function PUT(req: NextRequest, { params }: { params: { propertyId: string } }) {
  const body = await req.json();
  const parsed = UpdateInventoryTemplateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, description, items } = parsed.data;

  const template = await prisma.$transaction(async (tx) => {
    let tmplId: string;
    const existing = await tx.inventoryTemplate.findUnique({ where: { propertyId: params.propertyId } });
    if (!existing) {
      const created = await tx.inventoryTemplate.create({ data: { propertyId: params.propertyId, name, description } });
      tmplId = created.id;
    } else {
      await tx.inventoryTemplate.update({ where: { id: existing.id }, data: { name, description } });
      tmplId = existing.id;
    }
    await tx.inventoryTemplateItem.deleteMany({ where: { templateId: tmplId } });
    if (items.length > 0) {
      await tx.inventoryTemplateItem.createMany({
        data: items.map((item) => ({ templateId: tmplId, ...item })),
      });
    }
    return tx.inventoryTemplate.findUnique({
      where: { id: tmplId },
      include: { items: { include: { product: true } } },
    });
  });

  return NextResponse.json(template);
}
