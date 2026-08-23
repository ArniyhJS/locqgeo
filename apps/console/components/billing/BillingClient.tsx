"use client";

import { useState } from "react";
import { topUpWalletAction } from "@/src/actions/billing";

interface WalletData {
  currency: string;
  availableBalance: number;
  reservedBalance: number;
  autoPauseThreshold: number;
}

interface Transaction {
  id: string;
  type: "TOP_UP" | "CAMPAIGN_DECREMENT" | "PO_INVOICE_SETTLEMENT" | "REFUND";
  amount: number;
  gateway?: string;
  status: "COMPLETED" | "PENDING" | "REJECTED";
  reference: string;
  createdAt: string;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-9941",
    type: "TOP_UP",
    amount: 500000,
    gateway: "PAYSTACK",
    status: "COMPLETED",
    reference: "ref_paystack_982341",
    createdAt: "2026-07-28T14:32:00Z",
  },
  {
    id: "tx-9940",
    type: "CAMPAIGN_DECREMENT",
    amount: -45000,
    gateway: "INTERNAL_LEDGER",
    status: "COMPLETED",
    reference: "camp_budget_dec_01",
    createdAt: "2026-07-28T12:00:00Z",
  },
  {
    id: "tx-9939",
    type: "PO_INVOICE_SETTLEMENT",
    amount: 1000000,
    gateway: "ENTERPRISE_PO",
    status: "COMPLETED",
    reference: "po_inv_2026_004",
    createdAt: "2026-07-25T09:15:00Z",
  },
];

const PRESET_AMOUNTS = [10000, 50000, 250000, 1000000];

export function BillingClient() {
  const [wallet, setWallet] = useState<WalletData>({
    currency: "NGN",
    availableBalance: 1455000,
    reservedBalance: 150000,
    autoPauseThreshold: 5000,
  });

  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Top Up Form State
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(50000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [gateway, setGateway] = useState<"PAYSTACK" | "FLUTTERWAVE" | "STRIPE">("PAYSTACK");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const tenantId = "123e4567-e89b-12d3-a456-426614174000";

  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const amountNgn = customAmount ? parseFloat(customAmount) : selectedAmount;
    const reference = `ref_${gateway.toLowerCase()}_${Date.now()}`;

    try {
      const res = await topUpWalletAction({
        tenantId,
        amountNgn,
        gateway,
        reference,
      });

      if (res.success) {
        setFeedback({
          type: "success",
          message: `Wallet topped up successfully! Transaction ID: ${res.transactionId}`,
        });

        // Update local wallet balance state
        setWallet((prev) => ({
          ...prev,
          availableBalance: prev.availableBalance + amountNgn,
        }));

        // Add to transaction history
        const newTx: Transaction = {
          id: res.transactionId,
          type: "TOP_UP",
          amount: amountNgn,
          gateway,
          status: "COMPLETED",
          reference,
          createdAt: new Date().toISOString(),
        };

        setTransactions((prev) => [newTx, ...prev]);
        setShowTopUpModal(false);
      } else {
        const errorMsg =
          typeof res.error === "string"
            ? res.error
            : JSON.stringify(res.error) || "Validation failed. Please check top-up input parameters.";
        setFeedback({
          type: "error",
          message: errorMsg,
        });
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "An unexpected error occurred during top-up.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Billing & Wallet Ledger
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● Prepaid Double-Entry Active
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Manage prepaid tenant wallets, daily budget reserves, and enterprise PO invoicing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTopUpModal(true)}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#ff6b00] to-[#ffa800] text-black font-bold text-sm shadow-lg shadow-[#ff6b00]/20 hover:opacity-95 transition-all flex items-center gap-2"
          >
            <span>⚡</span> Top Up Wallet
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === "success" ? "✅" : "⚠️"}</span>
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-white text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Balance Card */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#10121a] to-[#151926] border border-gray-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#ff6b00]/10 rounded-full blur-2xl group-hover:bg-[#ff6b00]/20 transition-all" />
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            Available Wallet Balance
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              ₦{wallet.availableBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-gray-400">{wallet.currency}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
            <span>Auto-Pause Threshold:</span>
            <span className="font-mono text-amber-400 font-semibold">
              ₦{wallet.autoPauseThreshold.toLocaleString()} NGN
            </span>
          </div>
        </div>

        {/* Reserved Balance Card */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#10121a] to-[#151926] border border-gray-800 shadow-xl relative overflow-hidden">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            Reserved Daily Cap Budget
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">
              ₦{wallet.reservedBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-gray-400">{wallet.currency}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
            <span>Enforcement Engine:</span>
            <span className="text-emerald-400 font-semibold">Redis Sub-50ms Lock</span>
          </div>
        </div>

        {/* Invoicing / PO Credit Card */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#10121a] to-[#151926] border border-gray-800 shadow-xl relative overflow-hidden">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            Enterprise PO Credit Line
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-400 font-mono">
              ₦5,000,000.00
            </span>
            <span className="text-xs font-semibold text-gray-400">Approved</span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
            <span>Active Invoices:</span>
            <span className="text-gray-200 font-medium">1 Issued (PO-2026-008)</span>
          </div>
        </div>
      </div>

      {/* Double-Entry Transaction Ledger Table */}
      <div className="p-6 rounded-xl bg-[#10121a] border border-gray-800 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Double-Entry Transaction Ledger</h2>
            <p className="text-xs text-gray-400">
              Audit logs of all debit reserves, top-ups, and daily budget decrements.
            </p>
          </div>
          <span className="text-xs text-gray-500 font-mono">Realtime Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="pb-3">Transaction ID</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Gateway / Channel</th>
                <th className="pb-3">Reference</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="py-3.5 font-mono text-white font-medium">{tx.id}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-300 border border-gray-700">
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3.5 text-gray-400">{tx.gateway || "SYSTEM"}</td>
                  <td className="py-3.5 font-mono text-gray-400">{tx.reference}</td>
                  <td
                    className={`py-3.5 font-mono font-bold ${
                      tx.amount > 0 ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}₦
                    {Math.abs(tx.amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        tx.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : tx.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-gray-400">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Top Up Wallet */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#10121a] border border-gray-800 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Top Up Tenant Wallet</h3>
                <p className="text-xs text-gray-400">Select payment gateway and amount in NGN.</p>
              </div>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTopUpSubmit} className="space-y-6">
              {/* Preset Amounts */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">
                  Select Preset Top-Up Amount
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount("");
                      }}
                      className={`py-2.5 rounded-lg border text-xs font-bold font-mono transition-all ${
                        selectedAmount === amt && !customAmount
                          ? "bg-[#ff6b00]/20 border-[#ff6b00] text-[#ff6b00]"
                          : "bg-gray-800/40 border-gray-700/60 text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      ₦{(amt / 1000).toLocaleString()}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  Or Enter Custom Amount (NGN)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-mono text-sm">
                    ₦
                  </span>
                  <input
                    type="number"
                    min="1000"
                    placeholder="e.g. 75000"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white font-mono text-sm focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>
                <p className="text-[10px] text-gray-500">Minimum top-up: NGN 1,000</p>
              </div>

              {/* Payment Gateway Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">
                  Select Payment Gateway
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["PAYSTACK", "FLUTTERWAVE", "STRIPE"] as const).map((gw) => (
                    <button
                      type="button"
                      key={gw}
                      onClick={() => setGateway(gw)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        gateway === gw
                          ? "bg-[#ff6b00]/10 border-[#ff6b00] text-[#ff6b00] font-bold"
                          : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                      }`}
                    >
                      <span className="block text-xs">{gw}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(false)}
                  className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#ff6b00] to-[#ffa800] text-black font-bold text-xs shadow-lg shadow-[#ff6b00]/20 hover:opacity-95 transition-all disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Confirm & Pay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
