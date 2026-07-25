export interface AntiCheatResult {
  passed: boolean;
  velocityValid: boolean;
  accuracyValid: boolean;
  spoofScore: number; // 0 to 100
  reason?: string;
}

export class AntiCheatFilter {
  private static MAX_ACCURACY_THRESHOLD_METERS = 50;
  private static MAX_VELOCITY_MPS = 30; // ~108 km/h max human terrestrial velocity for claims

  public static evaluatePing(
    lat: number,
    lng: number,
    accuracyMeters: number,
    velocityMps: number = 0,
    prevPing?: { lat: number; lng: number; timestamp: number },
    currentTimestamp: number = Date.now()
  ): AntiCheatResult {
    let accuracyValid = true;
    let velocityValid = true;
    let spoofScore = 0;
    let reason: string | undefined;

    // 1. Accuracy Filter
    if (accuracyMeters > this.MAX_ACCURACY_THRESHOLD_METERS) {
      accuracyValid = false;
      spoofScore += 40;
      reason = `GPS accuracy degraded (${accuracyMeters}m > ${this.MAX_ACCURACY_THRESHOLD_METERS}m)`;
    }

    // 2. Velocity / Speed-of-Light Filter
    if (velocityMps > this.MAX_VELOCITY_MPS) {
      velocityValid = false;
      spoofScore += 50;
      reason = reason ? `${reason}; Excessive velocity (${velocityMps.toFixed(1)} m/s)` : `Excessive velocity (${velocityMps.toFixed(1)} m/s)`;
    }

    // 3. Time Delta & Distance Sanity Check
    if (prevPing) {
      const timeDeltaSeconds = (currentTimestamp - prevPing.timestamp) / 1000;
      if (timeDeltaSeconds > 0) {
        // Simple distance delta estimation
        const latDeltaMeters = Math.abs(lat - prevPing.lat) * 111000;
        const lngDeltaMeters = Math.abs(lng - prevPing.lng) * 111000 * Math.cos((lat * Math.PI) / 180);
        const distanceMeters = Math.sqrt(latDeltaMeters * latDeltaMeters + lngDeltaMeters * lngDeltaMeters);
        const calculatedVelocity = distanceMeters / timeDeltaSeconds;

        if (calculatedVelocity > this.MAX_VELOCITY_MPS) {
          velocityValid = false;
          spoofScore += 60;
          reason = `Teleportation anomaly: calculated speed ${calculatedVelocity.toFixed(1)} m/s`;
        }
      }
    }

    const passed = accuracyValid && velocityValid && spoofScore < 50;

    return {
      passed,
      velocityValid,
      accuracyValid,
      spoofScore,
      reason,
    };
  }
}
