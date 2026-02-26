import { NextRequest, NextResponse } from "next/server";
import { TriggerAgentSchema } from "@/lib/zod-schemas";
import { addInventoryGapAnalysisJob } from "@/jobs/queue";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = TriggerAgentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const job = await addInventoryGapAnalysisJob(parsed.data.reservationId);
  return NextResponse.json({ jobId: job.id, message: "Agent job queued" }, { status: 202 });
}
