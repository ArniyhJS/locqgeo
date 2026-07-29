import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("Drop App Design System", () => {
  it("contains cyber-gamified CSS variables and keyframes", () => {
    const cssPath = path.join(__dirname, "../src/app/globals.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");
    expect(cssContent).toContain("#0A0D14");
    expect(cssContent).toContain("flame-flicker");
    expect(cssContent).toContain("glass-card");
  });
});
