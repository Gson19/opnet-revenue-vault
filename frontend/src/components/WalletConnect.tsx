import { useEffect, useState } from "react";
import { getOPNetProvider } from "../lib/opnet-contracts";

interface WalletConnectProps {
  onConnected(address: string): void;
}

export function WalletConnect({ onConnected }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if OP_Wallet is already connected
    const checkConnection = async () => {
      try {
        const provider = await getOPNetProvider();
        const accounts = await provider.requestAccounts();
        if (accounts && accounts.length > 0) {
          const addr = accounts[0];
          setAddress(addr);
          onConnected(addr);
        }
      } catch (e) {
        // Not connected, that's okay
      }
    };

    checkConnection();
  }, [onConnected]);

  const connect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const provider = await getOPNetProvider();
      const accounts = await provider.requestAccounts();
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned from wallet");
      }
      
      const addr = accounts[0];
      setAddress(addr);
      onConnected(addr);
    } catch (e: any) {
      setError(e.message ?? "Failed to connect OP_NET wallet");
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

