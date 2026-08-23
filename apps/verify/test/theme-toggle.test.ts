import { describe, expect, it } from "vitest";
import { ThemeToggle } from "../components/theme/ThemeToggle";
import { ThemeProvider } from "../components/theme/ThemeProvider";

describe("Theme Components", () => {
  it("exports valid ThemeToggle React component", () => {
    expect(ThemeToggle).toBeDefined();
    expect(typeof ThemeToggle).toBe("function");
  });

  it("exports valid ThemeProvider React component", () => {
    expect(ThemeProvider).toBeDefined();
    expect(typeof ThemeProvider).toBe("function");
  });
});
