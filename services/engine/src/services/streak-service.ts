export interface StreakCalculationResult {
  newStreak: number;
  multiplier: number;
  usedStreakSaver: boolean;
  saversRemaining: number;
}

function toUtcMidnight(dateInput: string): number {
  const d = new Date(dateInput);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function calculateStreakAndMultiplier(
  lastCheckinDateStr: string,
  currentDateStr: string,
  currentStreak: number,
  streakSaversRemaining: number
): StreakCalculationResult {
  const lastUtc = toUtcMidnight(lastCheckinDateStr);
  const currUtc = toUtcMidnight(currentDateStr);

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.round((currUtc - lastUtc) / msPerDay);

  let newStreak = currentStreak;
  let usedStreakSaver = false;
  let saversRemaining = streakSaversRemaining;

  if (diffDays === 1) {
    newStreak = currentStreak + 1;
  } else if (diffDays <= 0) {
    newStreak = currentStreak;
  } else {
    // Missed 1+ days (diffDays >= 2)
    if (streakSaversRemaining > 0) {
      usedStreakSaver = true;
      saversRemaining = streakSaversRemaining - 1;
      newStreak = currentStreak;
    } else {
      newStreak = 1;
    }
  }

  // Calculate multiplier
  let multiplier = 1.0;
  if (newStreak >= 30) {
    multiplier = 1.5;
  } else if (newStreak >= 7) {
    multiplier = 1.3;
  } else if (newStreak >= 3) {
    multiplier = 1.15;
  } else {
    multiplier = 1.0;
  }

  return {
    newStreak,
    multiplier,
    usedStreakSaver,
    saversRemaining,
  };
}
