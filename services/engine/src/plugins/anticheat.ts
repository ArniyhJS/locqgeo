import { VerificationStatus } from "@spottgeo/api-contracts";

export interface AntiCheatResult {
  passed: boolean;
  velocityValid: boolean;
  accuracyValid: boolean;
  rateLimitValid: boolean;
  spoofScore: number; // 0 to 100
  fraudScore: number; // 0.000 to 1.000
  fraudSignals: string[];
  status: VerificationStatus;
  reason?: string;
}

export interface PriorPingData {
  distanceDeltaMeters: number;
  timeDeltaSeconds: number;
}

export class AntiCheatFilter {
  public static MAX_ACCURACY_THRESHOLD_METERS = 50;
  public static MAX_VELOCITY_MPS = 30; // ~108 km/h max human terrestrial velocity for claims
  public static MAX_VERIFICATIONS_PER_MINUTE = 5; // Sliding window rate limit per device

  public static checkRateLimit(
    recentPingTimestamps: number[],
    nowTimestamp: number = Date.now(),
    maxAllowed: number = AntiCheatFilter.MAX_VERIFICATIONS_PER_MINUTE,
    windowSeconds: number = 60
  ): boolean {
    const windowStart = nowTimestamp - windowSeconds * 1000;
    const recentCount = recentPingTimestamps.filter((t) => t >= windowStart).length;
    return recentCount < maxAllowed;
  }

  public static evaluatePing(
    lat: number,
    lng: number,
    accuracyMeters: number,
    velocityMps: number = 0,
    priorPing?: PriorPingData | { lat: number; lng: number; timestamp: number },
    currentTimestamp: number = Date.now(),
    recentDevicePingTimestamps: number[] = []
  ): AntiCheatResult {
    let accuracyValid = true;
    let velocityValid = true;
    let rateLimitValid = true;
    let spoofScore = 0;
    const fraudSignals: string[] = [];
    const reasons: string[] = [];

    // 1. Accuracy Filter
    if (accuracyMeters > this.MAX_ACCURACY_THRESHOLD_METERS) {
      accuracyValid = false;
      spoofScore += 40;
      fraudSignals.push("LOW_GPS_ACCURACY");
      reasons.push(`GPS accuracy degraded (${accuracyMeters.toFixed(1)}m > ${this.MAX_ACCURACY_THRESHOLD_METERS}m)`);
    }

    // 2. Client Velocity Filter
    if (velocityMps > this.MAX_VELOCITY_MPS) {
      velocityValid = false;
      spoofScore += 50;
      fraudSignals.push("EXCESSIVE_CLIENT_VELOCITY");
      reasons.push(`Excessive client velocity (${velocityMps.toFixed(1)} m/s)`);
    }

    // 3. Sliding Window Rate Limit Check
    if (recentDevicePingTimestamps.length > 0) {
      const isWithinRateLimit = this.checkRateLimit(recentDevicePingTimestamps, currentTimestamp);
      if (!isWithinRateLimit) {
        rateLimitValid = false;
        spoofScore += 50;
        fraudSignals.push("RATE_LIMIT_EXCEEDED");
        reasons.push(`Per-device rate limit exceeded (max ${this.MAX_VERIFICATIONS_PER_MINUTE} pings per 60s)`);
      }
    }

    // 4. Time Delta & Distance Sanity Check (Teleportation Anomaly Filter)
    if (priorPing) {
      let distanceDeltaMeters = 0;
      let timeDeltaSeconds = 0;

      if ("distanceDeltaMeters" in priorPing && "timeDeltaSeconds" in priorPing) {
        distanceDeltaMeters = priorPing.distanceDeltaMeters;
        timeDeltaSeconds = priorPing.timeDeltaSeconds;
      } else {
        timeDeltaSeconds = (currentTimestamp - priorPing.timestamp) / 1000;
        const latDeltaMeters = Math.abs(lat - priorPing.lat) * 111000;
        const lngDeltaMeters = Math.abs(lng - priorPing.lng) * 111000 * Math.cos((lat * Math.PI) / 180);
        distanceDeltaMeters = Math.sqrt(latDeltaMeters * latDeltaMeters + lngDeltaMeters * lngDeltaMeters);
      }

      if (timeDeltaSeconds === 0 && distanceDeltaMeters > 10) {
        velocityValid = false;
        spoofScore += 80;
        fraudSignals.push("ZERO_TIME_TELEPORT");
        reasons.push("Zero-time teleportation anomaly: position changed instantaneously");
      } else if (timeDeltaSeconds > 0) {
        const calculatedVelocity = distanceDeltaMeters / timeDeltaSeconds;
        if (calculatedVelocity > this.MAX_VELOCITY_MPS) {
          velocityValid = false;
          spoofScore += 60;
          fraudSignals.push("TELEPORTATION_ANOMALY");
          reasons.push(`Teleportation anomaly: calculated speed ${calculatedVelocity.toFixed(1)} m/s exceeds max threshold ${this.MAX_VELOCITY_MPS} m/s`);
        }
      }
    }

    // Determine status
    let status: VerificationStatus = "VERIFIED";
    if (!accuracyValid) {
      status = "REJECTED_ACCURACY";
    } else if (!rateLimitValid) {
      status = "REJECTED_RATE_LIMIT";
    } else if (!velocityValid) {
      status = "REJECTED_VELOCITY";
    } else if (spoofScore >= 50) {
      status = "REJECTED_SPOOF";
    }

    const passed = accuracyValid && velocityValid && rateLimitValid && spoofScore < 50;
    const boundedSpoofScore = Math.min(spoofScore, 100);
    const fraudScore = parseFloat((boundedSpoofScore / 100).toFixed(3));

    return {
      passed,
      velocityValid,
      accuracyValid,
      rateLimitValid,
      spoofScore: boundedSpoofScore,
      fraudScore,
      fraudSignals,
      status,
      reason: reasons.length > 0 ? reasons.join("; ") : undefined,
    };
  }
}
