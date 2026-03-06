import { useEffect, useState } from "react";
import { getProvider } from "../lib/contracts";

interface WalletConnectProps {
  onConnected(address: string): void;
}

export function WalletConnect({ onConnected }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const anyWindow = window as any;
    const injected =
      anyWindow.opnet ||
      (anyWindow.ethereum && anyWindow.ethereum.isOPNet) ||
      anyWindow.ethereum;

    if (!injected) return;

    injected.on?.("accountsChanged", (accounts: string[]) => {
      const next = accounts[0] ?? null;
      setAddress(next);
      if (next) onConnected(next);
    });
  }, [onConnected]);

  const connect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const provider = await getProvider();
      const accounts = await provider.send("eth_requestAccounts", []);
      const addr = accounts[0];
      setAddress(addr);
      onConnected(addr);
    } catch (e: any) {
      setError(e.message ?? "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  };

  if (address) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs md:text-sm">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="font-mono text-slate-300">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={connect}
        disabled={connecting}
        className="rounded-full bg-brand-600 px-4 py-2 text-xs font-medium text-slate-50 shadow-lg shadow-sky-500/30 transition hover:bg-brand-500"
      >
        {connecting ? "Connecting…" : "Connect OP_NET Wallet"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

