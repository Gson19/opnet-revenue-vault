import { FormEvent, useState } from "react";
import { deposit, withdraw } from "../lib/contracts";
import { OP_NET_CONFIG } from "../config";

interface BaseProps {
  tokenSymbol: string;
  onCompleted(): void;
}

export function DepositForm({ tokenSymbol, onCompleted }: BaseProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await deposit(amount);
      setAmount("");
      onCompleted();
    } catch (err: any) {
      setError(err.message ?? "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
    >
      <h3 className="text-sm font-semibold text-slate-100">Deposit</h3>
      <p className="text-xs text-slate-400">
        You are depositing {tokenSymbol} into the Revenue Vault. You will receive vault
        shares in return, which represent your share of the auto-compounding pool.
      </p>
      <div className="mt-2 space-y-2">
        <label className="text-xs font-medium text-slate-400">Amount</label>
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
          <input
            type="number"
            min="0"
            step={1 / 10 ** OP_NET_CONFIG.underlyingTokenDecimals}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-50 outline-none"
            placeholder={`0.0 ${tokenSymbol}`}
          />
          <span className="text-xs text-slate-400">{tokenSymbol}</span>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading || !amount}
        className="mt-1 w-full rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-slate-50 shadow-lg shadow-sky-500/30 transition hover:bg-brand-500"
      >
        {loading ? "Depositing…" : `Deposit ${tokenSymbol}`}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}

export function WithdrawForm({ tokenSymbol, onCompleted }: BaseProps) {
  const [shares, setShares] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await withdraw(shares);
      setShares("");
      onCompleted();
    } catch (err: any) {
      setError(err.message ?? "Withdraw failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
    >
      <h3 className="text-sm font-semibold text-slate-100">Withdraw</h3>
      <p className="text-xs text-slate-400">
        Burn your vault shares to withdraw your proportional share of the underlying
        {` ${tokenSymbol} `}from the auto-compounding pool.
      </p>
      <div className="mt-2 space-y-2">
        <label className="text-xs font-medium text-slate-400">Shares</label>
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
          <input
            type="number"
            min="0"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-50 outline-none"
            placeholder="0.0 Shares"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading || !shares}
        className="mt-1 w-full rounded-xl bg-slate-800 px-3 py-2 text-sm font-medium text-slate-50 transition hover:bg-slate-700"
      >
        {loading ? "Withdrawing…" : "Withdraw"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}

