import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

export const agentQueue = new Queue("agent", {
  connection: redis,
});

export async function addInventoryGapAnalysisJob(reservationId: string) {
  return agentQueue.add(
    "inventory-gap-analysis",
    { reservationId },
    { attempts: 3, backoff: { type: "exponential", delay: 1000 } }
  );
}
