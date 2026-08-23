import { describe, expect, it } from "vitest";
import { RadarScanner } from "../components/RadarScanner";
import { VerificationFeedbackDrawer } from "../components/VerificationFeedbackDrawer";
import { VerificationHistory } from "../components/VerificationHistory";

describe("LocqVerify UI Components", () => {
  it("exports valid RadarScanner React component", () => {
    expect(RadarScanner).toBeDefined();
    expect(typeof RadarScanner).toBe("function");
  });

  it("exports valid VerificationFeedbackDrawer React component", () => {
    expect(VerificationFeedbackDrawer).toBeDefined();
    expect(typeof VerificationFeedbackDrawer).toBe("function");
  });

  it("exports valid VerificationHistory React component", () => {
    expect(VerificationHistory).toBeDefined();
    expect(typeof VerificationHistory).toBe("function");
  });
});
