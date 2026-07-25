"use client";

interface PayoutStatusPillProps {
  status: "NOT_APPLICABLE" | "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
}

export function PayoutStatusPill({ status }: PayoutStatusPillProps) {
  const styles = {
    QUEUED: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    FAILED: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    NOT_APPLICABLE: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${styles[status]}`}>
      ● {status}
    </span>
  );
}
