import { describe, expect, it } from "vitest";
import { calculateStreakAndMultiplier } from "../src/services/streak-service";

describe("Streak Calculator Service", () => {
  it("increments streak when checkin is consecutive day", () => {
    const res = calculateStreakAndMultiplier("2026-07-28", "2026-07-29", 2, 1);
    expect(res.newStreak).toBe(3);
    expect(res.multiplier).toBe(1.15);
    expect(res.usedStreakSaver).toBe(false);
    expect(res.saversRemaining).toBe(1);
  });

  it("handles same day checkin without incrementing streak", () => {
    const res = calculateStreakAndMultiplier("2026-07-29", "2026-07-29", 5, 1);
    expect(res.newStreak).toBe(5);
    expect(res.multiplier).toBe(1.15);
    expect(res.usedStreakSaver).toBe(false);
    expect(res.saversRemaining).toBe(1);
  });

  it("uses streak saver if day missed and saver available", () => {
    const res = calculateStreakAndMultiplier("2026-07-27", "2026-07-29", 5, 1);
    expect(res.newStreak).toBe(5);
    expect(res.usedStreakSaver).toBe(true);
    expect(res.saversRemaining).toBe(0);
    expect(res.multiplier).toBe(1.15);
  });

  it("resets streak to 1 if day missed and no saver available", () => {
    const res = calculateStreakAndMultiplier("2026-07-27", "2026-07-29", 5, 0);
    expect(res.newStreak).toBe(1);
    expect(res.multiplier).toBe(1.0);
    expect(res.usedStreakSaver).toBe(false);
    expect(res.saversRemaining).toBe(0);
  });

  describe("Multiplier Thresholds", () => {
    it("calculates 1.0x multiplier for 1-2 days streak", () => {
      const res1 = calculateStreakAndMultiplier("2026-07-28", "2026-07-29", 0, 0);
      expect(res1.newStreak).toBe(1);
      expect(res1.multiplier).toBe(1.0);

      const res2 = calculateStreakAndMultiplier("2026-07-28", "2026-07-29", 1, 0);
      expect(res2.newStreak).toBe(2);
      expect(res2.multiplier).toBe(1.0);
    });

    it("calculates 1.15x multiplier for 3-6 days streak", () => {
      const res = calculateStreakAndMultiplier("2026-07-28", "2026-07-29", 2, 0);
      expect(res.newStreak).toBe(3);
      expect(res.multiplier).toBe(1.15);

      const res6 = calculateStreakAndMultiplier("2026-07-28", "2026-07-29", 5, 0);
      expect(res6.newStreak).toBe(6);
      expect(res6.multiplier).toBe(1.15);
    });

    it("calculates 1.3x multiplier for 7-29 days streak", () => {
      const res7 = calculateStreakAndMultiplier("2026-07-28", "2026-07-29", 6, 0);
      expect(res7.newStreak).toBe(7);
      expect(res7.multiplier).toBe(1.3);

      const res29 = calculateStreakAndMultiplier("2026-07-28", "2026-07-29", 28, 0);
      expect(res29.newStreak).toBe(29);
      expect(res29.multiplier).toBe(1.3);
    });

    it("calculates 1.5x multiplier for 30+ days streak", () => {
      const res30 = calculateStreakAndMultiplier("2026-07-28", "2026-07-29", 29, 0);
      expect(res30.newStreak).toBe(30);
      expect(res30.multiplier).toBe(1.5);
    });
  });

  it("handles ISO date strings with timestamps correctly", () => {
    const res = calculateStreakAndMultiplier(
      "2026-07-28T14:30:00.000Z",
      "2026-07-29T09:15:00.000Z",
      3,
      0
    );
    expect(res.newStreak).toBe(4);
    expect(res.multiplier).toBe(1.15);
  });
});
