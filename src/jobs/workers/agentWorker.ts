import { Worker } from "bullmq";
import { redis } from "@/lib/redis";
import { runInventoryGapAnalysis } from "@/agent/workflows/inventoryGapAnalysis";

const worker = new Worker(
  "agent",
  async (job) => {
    if (job.name === "inventory-gap-analysis") {
      const { reservationId } = job.data as { reservationId: string };
      console.log(`[Worker] Processing inventory gap analysis for reservation ${reservationId}`);
      const result = await runInventoryGapAnalysis(reservationId);
      console.log(`[Worker] Completed: created cart ${result.cartId} with ${result.itemsAdded} items`);
      return result;
    }
  },
  { connection: redis }
);

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});

console.log("[Worker] Agent worker started");
