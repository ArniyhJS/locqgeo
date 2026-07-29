export interface SpoofScoreParams {
  accuracyMeters: number;
  velocityMps: number;
  isVpnOrProxy: boolean;
  deviceTrustScore: number;
}

export interface SpoofScoreBreakdown {
  accuracyRisk: number;
  velocityRisk: number;
  networkRisk: number;
  deviceRisk: number;
}

export interface SpoofScoreResult {
  spoofScore: number;
  action: "VERIFIED" | "VERIFIED_FLAGGED" | "REJECTED_SPOOF";
  breakdown: SpoofScoreBreakdown;
}

export function calculateSpoofScore(params: SpoofScoreParams): SpoofScoreResult {
  const accuracyRisk = Math.min(100, Math.max(0, (params.accuracyMeters - 10) * 2.5));
  const velocityRisk = Math.min(100, Math.max(0, (params.velocityMps - 10) * 2.2));
  const networkRisk = params.isVpnOrProxy ? 100 : 0;
  const deviceRisk = Math.min(100, Math.max(0, 100 - params.deviceTrustScore));

  const spoofScore = Math.round(
    0.35 * accuracyRisk + 0.30 * velocityRisk + 0.20 * networkRisk + 0.15 * deviceRisk
  );

  let action: "VERIFIED" | "VERIFIED_FLAGGED" | "REJECTED_SPOOF" = "VERIFIED";
  if (spoofScore >= 60) {
    action = "REJECTED_SPOOF";
  } else if (spoofScore >= 30) {
    action = "VERIFIED_FLAGGED";
  }

  return {
    spoofScore,
    action,
    breakdown: {
      accuracyRisk: Math.round(accuracyRisk),
      velocityRisk: Math.round(velocityRisk),
      networkRisk: Math.round(networkRisk),
      deviceRisk: Math.round(deviceRisk),
    },
  };
}
