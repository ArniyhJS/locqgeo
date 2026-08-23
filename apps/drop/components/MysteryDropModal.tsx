"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative max-w-sm w-full">
        <Card
          onClick={() => setIsFlipped(!isFlipped)}
          className="cursor-pointer p-8 text-center space-y-6 border-amber-500/40 shadow-2xl transition-all duration-300 hover:scale-102"
        >
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="text-7xl animate-bounce">
              {isFlipped ? "🎉" : "🎁"}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              {isFlipped ? "Reward Unlocked!" : "Tap Box to Flip & Reveal"}
            </span>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
              {isFlipped ? rewardTitle : "Mystery Drop Box"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isFlipped ? rewardDescription : "Daily geofence check-in reward card ready to open!"}
            </p>
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            variant="secondary"
            size="default"
            className="w-full text-xs font-bold uppercase tracking-wider"
          >
            Close Modal
          </Button>
        </Card>
      </div>
    </div>
  );
}
