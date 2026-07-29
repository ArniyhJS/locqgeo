import { describe, expect, it } from "vitest";
import { DEFAULT_FEATURES, DEFAULT_PLANS } from "../src/seed";

describe("Database Seed Script Definitions", () => {
  it("defines 8 default feature definitions", () => {
    expect(DEFAULT_FEATURES.length).toBe(8);
    const keys = DEFAULT_FEATURES.map((f) => f.key);
    expect(keys).toContain("anti_cheat");
    expect(keys).toContain("webhooks");
    expect(keys).toContain("sdk_access");
  });

  it("defines 7 default plans", () => {
    expect(DEFAULT_PLANS.length).toBe(7);
    const slugs = DEFAULT_PLANS.map((p) => p.slug);
    expect(slugs).toContain("b2b_free");
    expect(slugs).toContain("b2b_pro");
    expect(slugs).toContain("b2c_premium");
  });
});
