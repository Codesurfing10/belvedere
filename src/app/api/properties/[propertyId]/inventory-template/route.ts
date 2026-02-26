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
    let tmpl = await tx.inventoryTemplate.findUnique({ where: { propertyId: params.propertyId } });
    if (!tmpl) {
      tmpl = await tx.inventoryTemplate.create({ data: { propertyId: params.propertyId, name, description } });
    } else {
      tmpl = await tx.inventoryTemplate.update({ where: { id: tmpl.id }, data: { name, description } });
    }
    await tx.inventoryTemplateItem.deleteMany({ where: { templateId: tmpl.id } });
    if (items.length > 0) {
      await tx.inventoryTemplateItem.createMany({
        data: items.map((item) => ({ templateId: tmpl!.id, ...item })),
      });
    }
    return tx.inventoryTemplate.findUnique({
      where: { id: tmpl.id },
      include: { items: { include: { product: true } } },
    });
  });

  return NextResponse.json(template);
}
