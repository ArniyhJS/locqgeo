"use client";

import React, { useState } from "react";

export interface MysteryDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardTitle?: string;
  rewardDescription?: string;
}

export function MysteryDropModal({
  isOpen,
  onClose,
  rewardTitle = "🎁 ₦500 Wallet Credit + 2x Multiplier Boost",
  rewardDescription = "Your geofence streak claim unlocked an instant mystery drop reward!",
}: MysteryDropModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-w-sm w-full">
        {/* 3D Glass Gift Box Card Trigger with Flip Animation */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="cursor-pointer glass-card p-8 text-center space-y-6 border-[#FF9F43]/40 shadow-[0_0_35px_rgba(255,159,67,0.3)] transition-all duration-500 hover:scale-105"
        >
          {/* Card Flip Icon State */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="text-7xl animate-bounce">
              {isFlipped ? "🎉" : "🎁"}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF9F43]">
              {isFlipped ? "Reward Unlocked!" : "Tap Box to Flip & Reveal"}
            </span>
            <h3 className="text-xl font-extrabold gradient-text-amber">
              {isFlipped ? rewardTitle : "Mystery Drop Box"}
            </h3>
            <p className="text-xs text-gray-300">
              {isFlipped ? rewardDescription : "Daily geofence check-in reward card ready to open!"}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-full py-3 rounded-xl glass-card border-white/20 text-xs font-bold uppercase tracking-wider text-gray-200 hover:bg-white/10 transition-colors"
          >
            Close Modal
          </button>
        </div>
      </div>
    </div>
  );
}
