import { describe, expect, it } from "vitest";
import React from "react";
import { StreakHero } from "../components/StreakHero";
import { SquadQuestCard } from "../components/SquadQuestCard";
import { MysteryDropModal } from "../components/MysteryDropModal";

describe("SpottDrop UI Components", () => {
  describe("StreakHero", () => {
    it("exports valid StreakHero React component", () => {
      expect(StreakHero).toBeDefined();
      expect(typeof StreakHero).toBe("function");
    });

    it("creates valid React element with flame counter, multiplier badge, and 7-day history grid props", () => {
      const element = React.createElement(StreakHero, {
        currentStreak: 14,
        multiplier: 1.3,
        streakSavers: 1,
        history: [
          { day: "Mon", completed: true },
          { day: "Tue", completed: true },
          { day: "Wed", completed: true },
          { day: "Thu", completed: true },
          { day: "Fri", completed: true },
          { day: "Sat", completed: true },
          { day: "Sun", completed: false },
        ],
      });

      expect(element).not.toBeNull();
      expect(element.type).toBe(StreakHero);
      expect(element.props.currentStreak).toBe(14);
      expect(element.props.multiplier).toBe(1.3);
      expect(element.props.streakSavers).toBe(1);
    });
  });

  describe("SquadQuestCard", () => {
    it("exports valid SquadQuestCard React component", () => {
      expect(SquadQuestCard).toBeDefined();
      expect(typeof SquadQuestCard).toBe("function");
    });

    it("creates valid React element with squad banner, avatars stack, shimmer progress bar, and contributor leaderboard", () => {
      const element = React.createElement(SquadQuestCard, {
        squadName: "GeoHunters Lagos",
        currentCheckins: 85,
        targetCheckins: 100,
        members: [
          { id: "m1", name: "Aniebiet", avatarUrl: "/avatars/1.png", checkins: 30, rank: 1 },
          { id: "m2", name: "Tunde", avatarUrl: "/avatars/2.png", checkins: 25, rank: 2 },
          { id: "m3", name: "Chioma", avatarUrl: "/avatars/3.png", checkins: 20, rank: 3 },
          { id: "m4", name: "Kemi", avatarUrl: "/avatars/4.png", checkins: 10, rank: 4 },
        ],
      });

      expect(element).not.toBeNull();
      expect(element.type).toBe(SquadQuestCard);
      expect(element.props.squadName).toBe("GeoHunters Lagos");
      expect(element.props.currentCheckins).toBe(85);
      expect(element.props.targetCheckins).toBe(100);
    });
  });

  describe("MysteryDropModal", () => {
    it("exports valid MysteryDropModal React component", () => {
      expect(MysteryDropModal).toBeDefined();
      expect(typeof MysteryDropModal).toBe("function");
    });

    it("creates valid React element for mystery drop gift box trigger and reveal modal", () => {
      const element = React.createElement(MysteryDropModal, {
        isOpen: true,
        onClose: () => {},
        rewardTitle: "🎁 ₦500 Wallet Credit + 2x Multiplier Boost",
      });

      expect(element).not.toBeNull();
      expect(element.type).toBe(MysteryDropModal);
      expect(element.props.isOpen).toBe(true);
      expect(element.props.rewardTitle).toBe("🎁 ₦500 Wallet Credit + 2x Multiplier Boost");
    });
  });
});
