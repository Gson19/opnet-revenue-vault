import { useEffect, useState } from "react";
import { WalletConnect } from "../components/WalletConnect";
import { VaultStats } from "../components/VaultStats";
import { DepositForm, WithdrawForm } from "../components/Forms";
import { CompoundButton } from "../components/CompoundButton";
import { ActivityFeed } from "../components/ActivityFeed";
import { getVaultStats, type VaultStats as VaultStatsType } from "../lib/opnet-contracts";
import { OP_NET_CONFIG } from "../config";

export function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [stats, setStats] = useState<VaultStatsType | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const refreshStats = async (addr: string | null = address) => {
    if (!OP_NET_CONFIG.revenueVaultAddress) return;
    setLoadingStats(true);
    try {
      const s = await getVaultStats(addr);
      setStats(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (OP_NET_CONFIG.revenueVaultAddress) {
      // Initial fetch with no user connected.
      void refreshStats(null);
    }
  }, []);

  const tokenSymbol = stats?.tokenSymbol || OP_NET_CONFIG.underlyingTokenSymbol;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-6 md:py-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              RV
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-100 md:text-base">
                OP_NET Revenue Vault
              </h1>
              <p className="text-[11px] text-slate-500 md:text-xs">
                Make your {tokenSymbol} work on Bitcoin L1 via OP_NET.
              </p>
            </div>
          </div>
        </div>
        <WalletConnect
          onConnected={(addr) => {
            setAddress(addr);
            void refreshStats(addr);
          }}
        />
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-12 md:px-6">
        {!OP_NET_CONFIG.revenueVaultAddress && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-xs text-amber-200">
            <p className="font-medium">Vault contract not configured.</p>
            <p className="mt-1">
              Set <code className="rounded bg-slate-900 px-1 py-0.5">VITE_REVENUE_VAULT_ADDRESS</code>{" "}
              in your <code className="rounded bg-slate-900 px-1 py-0.5">.env.local</code> after
              deploying the vault to OP_NET.
            </p>
          </div>
        )}

        <VaultStats stats={stats} loading={loadingStats} />

        <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <DepositForm
                tokenSymbol={tokenSymbol}
                onCompleted={() => void refreshStats(address)}
              />
              <WithdrawForm
                tokenSymbol={tokenSymbol}
                onCompleted={() => void refreshStats(address)}
              />
            </div>
            <CompoundButton onCompleted={() => void refreshStats(address)} />
          </div>
          <ActivityFeed />
        </section>
      </main>
    </div>
  );
}

