"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NodeItem {
  id: string;
  title: string;
  lat: number;
  lng: number;
  rewardType: string;
  rewardAmount: number;
  distanceMeters: number;
}

interface NodeDetailsSheetProps {
  node: NodeItem | null;
  onClose: () => void;
  onScanClick: (geofenceId: string) => void;
}

export function NodeDetailsSheet({ node, onClose, onScanClick }: NodeDetailsSheetProps) {
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-4">
      <div className="w-full max-w-md bg-[var(--bg-surface)] p-6 rounded-3xl space-y-6 border border-emerald-500/30 shadow-2xl animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between">
          <Badge variant="success">
            {node.rewardType} DROP
          </Badge>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold px-2 py-1"
          >
            ✕ Close
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-[var(--text-primary)] leading-snug">{node.title}</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Coordinates: {node.lat.toFixed(4)}°, {node.lng.toFixed(4)}°
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
          <div>
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Reward Amount</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">₦ {node.rewardAmount}</div>
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Proximity</span>
            <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">~{node.distanceMeters}m</div>
          </div>
        </div>

        <Button
          onClick={() => onScanClick(node.id)}
          variant="default"
          size="lg"
          className="w-full py-3.5 text-sm font-bold shadow-lg shadow-emerald-500/20"
        >
          📷 Scan Billboard QR & Claim Reward
        </Button>
      </div>
    </div>
  );
}
