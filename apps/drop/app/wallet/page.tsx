"use client";

import { useState } from "react";

export default function WalletPage() {
  const [withdrawing, setWithdrawing] = useState(false);
  const [message, setMessage] = useState("");

  const handleWithdraw = (type: string) => {
    setWithdrawing(true);
    setTimeout(() => {
      setMessage(`Instant ${type} payout dispatched via SpottGrid!`);
      setWithdrawing(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Rewards Wallet</h1>
        <p className="text-xs text-gray-400 mt-0.5">Your earnings from geofenced drop claims.</p>
      </div>

      {/* Balance Card */}
      <div className="pwa-card p-6 bg-gradient-to-tr from-cyan-950/80 to-blue-900/50 border border-cyan-500/30 space-y-3">
        <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Available Balance</span>
        <div className="text-3xl font-extrabold text-white">₦ 4,500.00</div>
        <div className="text-xs text-emerald-400 font-medium">Ready for instant withdrawal</div>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
          ✅ {message}
        </div>
      )}

      {/* Withdrawal Options */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Withdraw Options</h3>

        <button
          onClick={() => handleWithdraw("Telco Airtime")}
          disabled={withdrawing}
          className="w-full p-4 rounded-xl pwa-card hover:border-cyan-500/50 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div>
            <p className="font-semibold text-sm text-white">Instant Telco Airtime Top-up</p>
            <p className="text-xs text-gray-400">MTN, Airtel, Glo, 9mobile via VTPass</p>
          </div>
          <span className="text-cyan-400 font-bold text-lg">⚡</span>
        </button>

        <button
          onClick={() => handleWithdraw("Paystack Bank Transfer")}
          disabled={withdrawing}
          className="w-full p-4 rounded-xl pwa-card hover:border-cyan-500/50 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div>
            <p className="font-semibold text-sm text-white">Direct Paystack Bank Transfer</p>
            <p className="text-xs text-gray-400">Instant deposit to any bank account</p>
          </div>
          <span className="text-blue-400 font-bold text-lg">🏦</span>
        </button>
      </div>
    </div>
  );
}
