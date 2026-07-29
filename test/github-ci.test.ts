import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("GitHub Actions CI Workflow", () => {
  it("defines workflow file with required jobs and actions", () => {
    const ciPath = path.join(__dirname, "../.github/workflows/ci.yml");
    expect(fs.existsSync(ciPath)).toBe(true);

    const content = fs.readFileSync(ciPath, "utf-8");
    expect(content).toContain("name: SpottGeo Monorepo CI");
    expect(content).toContain("pnpm run check-types");
    expect(content).toContain("pnpm run test");
    expect(content).toContain("actions/setup-node");
    expect(content).toContain("pnpm/action-setup");
    expect(content).toContain("check-types:");
    expect(content).toContain("test:");
    expect(content).toContain("ubuntu-latest");
    expect(content).toContain("node-version: 20");
    expect(content).toContain("version: 10");
  });
});
