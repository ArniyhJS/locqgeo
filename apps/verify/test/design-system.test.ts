import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("Verify App Design System", () => {
  it("contains semantic light and dark mode CSS variables and keyframes", () => {
    const cssPath = path.join(__dirname, "../app/globals.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");
    expect(cssContent).toContain("--bg-canvas");
    expect(cssContent).toContain("--brand-primary");
    expect(cssContent).toContain("radar-ping");
    expect(cssContent).toContain("glass-card");
  });
});
