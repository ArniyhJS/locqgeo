import { db, sql } from "@locqgeo/database";

export interface AnalyticsSummary {
  totalVerificationsToday: number;
  totalVerifiedToday: number;
  totalRejectedToday: number;
  activeCampaignsCount: number;
}

export class AnalyticsAggregatorService {
  /**
   * Calculates high-level telemetry metrics for dashboard caching.
   */
  public static async computeDailyTelemetrySummary(): Promise<AnalyticsSummary> {
    const statsResult = (await db.execute(sql`
      SELECT
        COUNT(*) AS total_pings,
        COUNT(*) FILTER (WHERE status = 'VERIFIED') AS total_verified,
        COUNT(*) FILTER (WHERE status != 'VERIFIED') AS total_rejected
      FROM verifications
      WHERE created_at >= CURRENT_DATE;
    `)) as unknown as Array<{
      total_pings: string | number;
      total_verified: string | number;
      total_rejected: string | number;
    }>;

    const campaignsResult = (await db.execute(sql`
      SELECT COUNT(*) AS active_count
      FROM campaigns
      WHERE is_active = true AND NOW() BETWEEN starts_at AND ends_at;
    `)) as unknown as Array<{ active_count: string | number }>;

    const stats = statsResult[0] || { total_pings: 0, total_verified: 0, total_rejected: 0 };
    const campaigns = campaignsResult[0] || { active_count: 0 };

    return {
      totalVerificationsToday: Number(stats.total_pings),
      totalVerifiedToday: Number(stats.total_verified),
      totalRejectedToday: Number(stats.total_rejected),
      activeCampaignsCount: Number(campaigns.active_count),
    };
  }

  public static async startAggregatorLoop(intervalMs = 60000): Promise<void> {
    console.log(
      `[AnalyticsWorker] Starting analytics aggregator loop with interval ${intervalMs}ms...`,
    );
    const run = async () => {
      try {
        const summary = await AnalyticsAggregatorService.computeDailyTelemetrySummary();
        console.log(
          `[AnalyticsWorker] Daily telemetry pre-aggregated: ${summary.totalVerifiedToday} verified, ${summary.totalRejectedToday} rejected, ${summary.activeCampaignsCount} active campaigns.`,
        );
      } catch (err) {
        console.error("[AnalyticsWorker] Aggregator error:", err);
      }
    };

    await run();
    setInterval(run, intervalMs);
  }
}

if (process.env.NODE_ENV !== "test" && import.meta.url === `file://${process.argv[1]}`) {
  AnalyticsAggregatorService.startAggregatorLoop();
}
