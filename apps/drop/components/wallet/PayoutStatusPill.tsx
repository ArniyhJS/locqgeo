"use client";

import { Badge } from "@/components/ui/badge";

interface PayoutStatusPillProps {
  status: "NOT_APPLICABLE" | "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
}

export function PayoutStatusPill({ status }: PayoutStatusPillProps) {
  const variantMap: Record<
    PayoutStatusPillProps["status"],
    "success" | "warning" | "destructive" | "secondary"
  > = {
    QUEUED: "warning",
    PROCESSING: "secondary",
    COMPLETED: "success",
    FAILED: "destructive",
    NOT_APPLICABLE: "secondary",
  };

  return (
    <Badge variant={variantMap[status] ?? "secondary"}>
      ● {status}
    </Badge>
  );
}
