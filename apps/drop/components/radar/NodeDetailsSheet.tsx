"use client";

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
  onScanClick: (nodeId: string) => void;
}

export function NodeDetailsSheet({ node, onClose, onScanClick }: NodeDetailsSheetProps) {
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center p-4">
      <div className="w-full max-w-md glass-card p-6 rounded-3xl space-y-6 border border-emerald-500/30 shadow-2xl animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {node.rewardType} DROP
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xs font-bold px-2 py-1">
            ✕ Close
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-white leading-snug">{node.title}</h3>
          <p className="text-xs text-gray-400">Coordinates: {node.lat.toFixed(4)}°, {node.lng.toFixed(4)}°</p>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Reward Amount</span>
            <div className="text-lg font-black text-emerald-400">₦ {node.rewardAmount}</div>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Proximity</span>
            <div className="text-lg font-black text-cyan-400">~{node.distanceMeters}m</div>
          </div>
        </div>

        <button
          onClick={() => onScanClick(node.id)}
          className="w-full glass-button py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl shadow-emerald-500/20 cursor-pointer"
        >
          📷 Scan Billboard QR & Claim Reward
        </button>
      </div>
    </div>
  );
}
