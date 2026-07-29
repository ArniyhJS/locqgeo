import { describe, expect, it } from "vitest";
import { StreakStatusSchema, CreateSquadSchema } from "@spottgeo/api-contracts";
import StreaksPage from "../app/(main)/streaks/page";
import SquadsPage from "../app/(main)/squads/page";

describe("SpottDrop Gamification & Squad PWA Pages", () => {
  it("validates streak schema payload for PWA rendering", () => {
    const valid = StreakStatusSchema.safeParse({
      userId: "123e4567-e89b-12d3-a456-426614174000",
      currentStreakDays: 7,
      longestStreakDays: 14,
      multiplier: 1.3,
      streakSaversRemaining: 1,
    });
    expect(valid.success).toBe(true);
  });

  it("validates squad creation payload for PWA rendering", () => {
    const valid = CreateSquadSchema.safeParse({
      name: "Cyber Ninjas",
    });
    expect(valid.success).toBe(true);
  });

  it("exports valid React component for StreaksPage", () => {
    expect(StreaksPage).toBeDefined();
    expect(typeof StreaksPage).toBe("function");
  });

  it("exports valid React component for SquadsPage", () => {
    expect(SquadsPage).toBeDefined();
    expect(typeof SquadsPage).toBe("function");
  });
});
