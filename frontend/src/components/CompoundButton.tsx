import { useState } from "react";
import { compoundNow } from "../lib/contracts";

interface Props {
  onCompleted(): void;
}

export function CompoundButton({ onCompleted }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await compoundNow();
      onCompleted();
    } catch (err: any) {
      setError(err.message ?? "Compound failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Auto-Compound</h3>
          <p className="text-xs text-slate-400">
            Anyone can trigger auto-compounding. In production this is typically handled
            by an off-chain keeper on OP_NET.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="rounded-xl bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400"
        >
          {loading ? "Compounding…" : "Compound now"}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

