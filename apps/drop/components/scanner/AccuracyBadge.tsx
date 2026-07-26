"use client";

interface AccuracyBadgeProps {
  accuracyMeters: number | null;
}

export function AccuracyBadge({ accuracyMeters }: AccuracyBadgeProps) {
  if (accuracyMeters === null) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-400 border border-gray-700">
        <span className="h-2 w-2 rounded-full bg-gray-500 animate-pulse" />
        GPS Inactive
      </span>
    );
  }

  const isGood = accuracyMeters <= 50.0;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${
        isGood
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${isGood ? "bg-emerald-400" : "bg-amber-400 animate-ping"}`}
      />
      GPS Accuracy: {accuracyMeters.toFixed(1)}m {isGood ? "(Verified)" : "(Weak Signal)"}
    </span>
  );
}
