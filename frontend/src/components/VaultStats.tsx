import type { VaultStats as VaultStatsType } from "../lib/contracts";
import { OP_NET_CONFIG } from "../config";

interface Props {
  stats: VaultStatsType | null;
  loading: boolean;
}

export function VaultStats({ stats, loading }: Props) {
  const tokenSymbol = stats?.tokenSymbol || OP_NET_CONFIG.underlyingTokenSymbol;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Revenue Vault
          </h2>
          <p className="mt-1 text-xl font-semibold text-slate-50">
            Auto-Compounding {tokenSymbol} Vault
          </p>
        </div>
        <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
          Live · Simulated APY
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat
          label="Total Value Locked"
          value={loading ? "…" : `${stats?.tvl ?? "0.00"} ${tokenSymbol}`}
        />
        <Stat
          label="Price Per Share"
          value={loading ? "…" : stats?.pricePerShare ?? "1.00"}
        />
        <Stat
          label="Your Deposited"
          value={loading ? "…" : `${stats?.userUnderlying ?? "0.00"} ${tokenSymbol}`}
        />
        <Stat
          label="Your Shares"
          value={loading ? "…" : stats?.userShares ?? "0.00"}
        />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-50">{value}</p>
    </div>
  );
}

