import { describe, expect, it } from "vitest";
import { userStreaks, mysteryDrops, leaderboardRanks, referrals, squads, squadMembers } from "../src/schema";

describe("Gamification Database Schemas", () => {
  it("exports userStreaks schema with correct columns", () => {
    expect(userStreaks).toBeDefined();
    expect(userStreaks.userId).toBeDefined();
    expect(userStreaks.currentStreakDays).toBeDefined();
    expect(userStreaks.streakSaversRemaining).toBeDefined();
  });

  it("exports mysteryDrops and referrals schemas", () => {
    expect(mysteryDrops).toBeDefined();
    expect(mysteryDrops.geofenceId).toBeDefined();
    expect(mysteryDrops.dropProbabilityPct).toBeDefined();
    expect(referrals).toBeDefined();
    expect(referrals.referralCode).toBeDefined();
  });

  it("exports leaderboardRanks schema", () => {
    expect(leaderboardRanks).toBeDefined();
    expect(leaderboardRanks.regionCode).toBeDefined();
    expect(leaderboardRanks.rankPosition).toBeDefined();
  });

  it("exports squads and squadMembers schemas", () => {
    expect(squads).toBeDefined();
    expect(squads.weeklyTargetClaims).toBeDefined();
    expect(squadMembers).toBeDefined();
    expect(squadMembers.role).toBeDefined();
  });
});
