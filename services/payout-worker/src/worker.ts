import { db, sql } from "@spottgeo/database";

export interface PendingPayoutJob {
  id: string;
  geofenceId: string;
  deviceId: string;
  userId?: string;
  rewardType: "AIRTIME" | "DATA" | "CASH" | "VOUCHER";
  rewardAmount: number;
  rewardCurrency: string;
}

export interface WorkerProcessingResult {
  processedCount: number;
  successfulCount: number;
  failedCount: number;
}

export class PayoutWorkerService {
  /**
   * Fetches queued payouts from the verifications table and executes payout processing.
   */
  public static async processQueuedPayouts(limit = 10): Promise<WorkerProcessingResult> {
    const pendingJobs = (await db.execute(sql`
      SELECT
        id,
        geofence_id AS "geofenceId",
        device_id AS "deviceId",
        user_id AS "userId",
        reward_type AS "rewardType",
        reward_amount AS "rewardAmount",
        reward_currency AS "rewardCurrency"
      FROM verifications
      WHERE payout_status = 'QUEUED'
      ORDER BY created_at ASC
      LIMIT ${limit};
    `)) as unknown as PendingPayoutJob[];

    let successfulCount = 0;
    let failedCount = 0;

    for (const job of pendingJobs) {
      try {
        const reference = `PWRK_${Date.now()}_${job.id.substring(0, 8)}`;
        
        await db.execute(sql`
          UPDATE verifications
          SET payout_status = 'COMPLETED',
              payout_reference = ${reference}
          WHERE id = ${job.id};
        `);

        successfulCount++;
      } catch (err) {
        await db.execute(sql`
          UPDATE verifications
          SET payout_status = 'FAILED'
          WHERE id = ${job.id};
        `);

        failedCount++;
      }
    }

    return {
      processedCount: pendingJobs.length,
      successfulCount,
      failedCount,
    };
  }

  public static async startWorkerLoop(intervalMs = 5000): Promise<void> {
    console.log(`[PayoutWorker] Starting worker loop with polling interval ${intervalMs}ms...`);
    const run = async () => {
      try {
        const res = await PayoutWorkerService.processQueuedPayouts(25);
        if (res.processedCount > 0) {
          console.log(`[PayoutWorker] Processed ${res.processedCount} jobs (${res.successfulCount} success, ${res.failedCount} failed)`);
        }
      } catch (err) {
        console.error("[PayoutWorker] Loop iteration error:", err);
      }
    };

    await run();
    setInterval(run, intervalMs);
  }
}

if (process.env.NODE_ENV !== "test" && import.meta.url === `file://${process.argv[1]}`) {
  PayoutWorkerService.startWorkerLoop();
}
