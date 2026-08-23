"use client";

import { useState } from "react";
import { topUpWalletAction } from "@/src/actions/billing";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(50000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [gateway, setGateway] = useState<"PAYSTACK" | "FLUTTERWAVE" | "STRIPE">("PAYSTACK");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

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

        setWallet((prev) => ({
          ...prev,
          availableBalance: prev.availableBalance + amountNgn,
        }));

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Billing & Wallet Ledger
            </h1>
            <Badge variant="success">
              ● Prepaid Ledger Active
            </Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage prepaid tenant wallets, daily budget reserves, and enterprise PO invoicing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowTopUpModal(true)}
            variant="default"
            size="default"
          >
            ⚡ Top Up Wallet
          </Button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === "success" ? "✅" : "⚠️"}</span>
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-500/10">
          <span className="text-[11px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
            Available Wallet Balance
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--text-primary)] font-mono">
              ₦{wallet.availableBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">{wallet.currency}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Auto-Pause Threshold:</span>
            <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
              ₦{wallet.autoPauseThreshold.toLocaleString()} NGN
            </span>
          </div>
        </Card>

        <Card className="border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10">
          <span className="text-[11px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
            Reserved Daily Cap Budget
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
              ₦{wallet.reservedBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">{wallet.currency}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Enforcement Engine:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Redis Sub-50ms Lock</span>
          </div>
        </Card>

        <Card className="border-sky-500/30 bg-sky-500/5 dark:bg-sky-500/10">
          <span className="text-[11px] uppercase font-bold text-sky-600 dark:text-sky-400 tracking-wider">
            Enterprise PO Credit Line
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-sky-600 dark:text-sky-400 font-mono">
              ₦5,000,000.00
            </span>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Approved</span>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Active Invoices:</span>
            <span className="text-[var(--text-primary)] font-medium">1 Issued (PO-2026-008)</span>
          </div>
        </Card>
      </div>

      {/* Double-Entry Transaction Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle>Double-Entry Transaction Ledger</CardTitle>
          <CardDescription>
            Audit logs of all debit reserves, top-ups, and daily budget decrements.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-secondary)]">
              <thead className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
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
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[var(--bg-surface-elevated)] transition-colors">
                    <td className="py-3.5 font-mono text-[var(--text-primary)] font-medium">{tx.id}</td>
                    <td className="py-3.5">
                      <Badge variant="secondary">
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-[var(--text-secondary)]">{tx.gateway || "SYSTEM"}</td>
                    <td className="py-3.5 font-mono text-[var(--text-muted)]">{tx.reference}</td>
                    <td
                      className={`py-3.5 font-mono font-bold ${
                        tx.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : ""}₦
                      {Math.abs(tx.amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5">
                      <Badge
                        variant={
                          tx.status === "COMPLETED"
                            ? "success"
                            : tx.status === "PENDING"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-[var(--text-muted)]">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Top Up Wallet */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <Card className="w-full max-w-lg shadow-2xl space-y-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Top Up Tenant Wallet</CardTitle>
                <CardDescription>Select payment gateway and amount in NGN.</CardDescription>
              </div>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-lg"
              >
                ✕
              </button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleTopUpSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">
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
                        className={`py-2.5 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer ${
                          selectedAmount === amt && !customAmount
                            ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                            : "bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        ₦{(amt / 1000).toLocaleString()}k
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">
                    Or Enter Custom Amount (NGN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[var(--text-muted)] font-mono text-sm">
                      ₦
                    </span>
                    <Input
                      type="number"
                      min="1000"
                      placeholder="e.g. 75000"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="pl-8 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">Minimum top-up: NGN 1,000</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">
                    Select Payment Gateway
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["PAYSTACK", "FLUTTERWAVE", "STRIPE"] as const).map((gw) => (
                      <button
                        type="button"
                        key={gw}
                        onClick={() => setGateway(gw)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          gateway === gw
                            ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                            : "bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        <span className="block text-xs font-semibold">{gw}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="default"
                    onClick={() => setShowTopUpModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    size="default"
                    loading={loading}
                  >
                    Confirm & Pay
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
