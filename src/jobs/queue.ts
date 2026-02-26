import { Queue } from "bullmq";
import { getRedis } from "@/lib/redis";

let _agentQueue: Queue | null = null;

export function getAgentQueue(): Queue {
  if (!_agentQueue) {
    _agentQueue = new Queue("agent", {
      connection: getRedis(),
    });
  }
  return _agentQueue;
}

export async function addInventoryGapAnalysisJob(reservationId: string) {
  return getAgentQueue().add(
    "inventory-gap-analysis",
    { reservationId },
    { attempts: 3, backoff: { type: "exponential", delay: 1000 } }
  );
}
