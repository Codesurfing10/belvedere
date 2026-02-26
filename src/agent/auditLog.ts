import { prisma } from "@/lib/prisma";

export async function createAuditLog(params: {
  reservationId: string;
  action: string;
  details: Record<string, unknown> | unknown[];
  triggeredBy: string;
}) {
  return prisma.agentAuditLog.create({
    data: {
      reservationId: params.reservationId,
      action: params.action,
      details: params.details as object,
      triggeredBy: params.triggeredBy,
    },
  });
}
