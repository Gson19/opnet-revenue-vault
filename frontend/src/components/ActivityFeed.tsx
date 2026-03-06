interface ActivityItem {
  type: "deposit" | "withdraw" | "compound";
  description: string;
  timestamp: string;
}

const mockActivity: ActivityItem[] = [
  {
    type: "deposit",
    description: "You deposited 0.05 wBTC-OPN into the vault.",
    timestamp: "2 min ago"
  },
  {
    type: "compound",
    description: "Keeper compounded vault rewards (+0.003 wBTC-OPN).",
    timestamp: "15 min ago"
  },
  {
    type: "withdraw",
    description: "You withdrew 0.01 wBTC-OPN from the vault.",
    timestamp: "1 hr ago"
  }
];

export function ActivityFeed() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">Vault Activity</h3>
        <span className="text-xs text-slate-500">Demo / mocked events</span>
      </div>
      <ul className="space-y-2 text-xs">
        {mockActivity.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 py-2"
          >
            <div className="flex items-start gap-2">
              <span
                className={`mt-1 h-2 w-2 rounded-full ${
                  item.type === "deposit"
                    ? "bg-sky-400"
                    : item.type === "withdraw"
                    ? "bg-rose-400"
                    : "bg-emerald-400"
                }`}
              />
              <p className="text-slate-200">{item.description}</p>
            </div>
            <span className="ml-3 shrink-0 text-[10px] text-slate-500">
              {item.timestamp}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

