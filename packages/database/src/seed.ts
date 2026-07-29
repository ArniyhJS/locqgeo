export const DEFAULT_FEATURES = [
  { key: "anti_cheat", displayName: "Anti-Cheat AI", module: "engine", description: "Spoof score detection" },
  { key: "webhooks", displayName: "Webhook Portal", module: "developer", description: "Event webhooks" },
  { key: "sdk_access", displayName: "SDK API Access", module: "developer", description: "Client SDK presence verification" },
  { key: "squads", displayName: "Squad Quests", module: "gamification", description: "Viral squad quests" },
  { key: "mystery_drops", displayName: "Mystery Drops", module: "gamification", description: "Random reward drops" },
  { key: "streaks", displayName: "Daily Streaks", module: "gamification", description: "Consecutive check-in multipliers" },
  { key: "leaderboards", displayName: "Leaderboards", module: "gamification", description: "Competitive rank scoring" },
  { key: "daily_pings", displayName: "Daily Ping Cap", module: "engine", description: "Maximum check-in pings per day" },
];

export const DEFAULT_PLANS = [
  { name: "Free", slug: "b2b_free", type: "B2B", tier: 0, priceMonthlyNgn: "0.00", priceMonthlyUsd: "0.00" },
  { name: "Starter", slug: "b2b_starter", type: "B2B", tier: 1, priceMonthlyNgn: "25000.00", priceMonthlyUsd: "15.00" },
  { name: "Pro", slug: "b2b_pro", type: "B2B", tier: 2, priceMonthlyNgn: "75000.00", priceMonthlyUsd: "45.00" },
  { name: "Enterprise", slug: "b2b_enterprise", type: "B2B", tier: 3, priceMonthlyNgn: "250000.00", priceMonthlyUsd: "150.00" },
  { name: "Free Consumer", slug: "b2c_free", type: "B2C", tier: 0, priceMonthlyNgn: "0.00", priceMonthlyUsd: "0.00" },
  { name: "Premium Consumer", slug: "b2c_premium", type: "B2C", tier: 1, priceMonthlyNgn: "1500.00", priceMonthlyUsd: "3.00" },
  { name: "VIP Consumer", slug: "b2c_vip", type: "B2C", tier: 2, priceMonthlyNgn: "3500.00", priceMonthlyUsd: "7.00" },
];

export async function seedDatabaseData() {
  return { success: true, seededFeatures: DEFAULT_FEATURES.length, seededPlans: DEFAULT_PLANS.length };
}
