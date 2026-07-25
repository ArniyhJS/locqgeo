export interface AntiCheatResult {
  passed: boolean;
  velocityValid: boolean;
  accuracyValid: boolean;
  spoofScore: number; // 0 to 100
  status: "VERIFIED" | "REJECTED_ACCURACY" | "REJECTED_VELOCITY" | "REJECTED_SPOOF";
  reason?: string;
}

export interface PriorPingData {
  distanceDeltaMeters: number;
  timeDeltaSeconds: number;
}

export class AntiCheatFilter {
  public static MAX_ACCURACY_THRESHOLD_METERS = 50;
  public static MAX_VELOCITY_MPS = 30; // ~108 km/h max human terrestrial velocity for claims

  public static evaluatePing(
    lat: number,
    lng: number,
    accuracyMeters: number,
    velocityMps: number = 0,
    priorPing?: PriorPingData | { lat: number; lng: number; timestamp: number },
    currentTimestamp: number = Date.now()
  ): AntiCheatResult {
    let accuracyValid = true;
    let velocityValid = true;
    let spoofScore = 0;
    const reasons: string[] = [];

    // 1. Accuracy Filter
    if (accuracyMeters > this.MAX_ACCURACY_THRESHOLD_METERS) {
      accuracyValid = false;
      spoofScore += 40;
      reasons.push(`GPS accuracy degraded (${accuracyMeters.toFixed(1)}m > ${this.MAX_ACCURACY_THRESHOLD_METERS}m)`);
    }

    // 2. Client Velocity Filter
    if (velocityMps > this.MAX_VELOCITY_MPS) {
      velocityValid = false;
      spoofScore += 50;
      reasons.push(`Excessive client velocity (${velocityMps.toFixed(1)} m/s)`);
    }

    // 3. Time Delta & Distance Sanity Check (Teleportation Anomaly Filter)
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
        reasons.push("Zero-time teleportation anomaly: position changed instantaneously");
      } else if (timeDeltaSeconds > 0) {
        const calculatedVelocity = distanceDeltaMeters / timeDeltaSeconds;
        if (calculatedVelocity > this.MAX_VELOCITY_MPS) {
          velocityValid = false;
          spoofScore += 60;
          reasons.push(`Teleportation anomaly: calculated speed ${calculatedVelocity.toFixed(1)} m/s exceeds max threshold ${this.MAX_VELOCITY_MPS} m/s`);
        }
      }
    }

    // Determine status
    let status: AntiCheatResult["status"] = "VERIFIED";
    if (!accuracyValid) {
      status = "REJECTED_ACCURACY";
    } else if (!velocityValid) {
      status = "REJECTED_VELOCITY";
    } else if (spoofScore >= 50) {
      status = "REJECTED_SPOOF";
    }

    const passed = accuracyValid && velocityValid && spoofScore < 50;

    return {
      passed,
      velocityValid,
      accuracyValid,
      spoofScore: Math.min(spoofScore, 100),
      status,
      reason: reasons.length > 0 ? reasons.join("; ") : undefined,
    };
  }
}
