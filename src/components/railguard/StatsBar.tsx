interface Stat {
  icon: string;
  label: string;
  value: string;
  accent?: string;
}

export function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-5 gap-3 px-5 py-3 bg-[#0a1628] border-b border-[#1f3358]">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-[#112244] border border-[#1f3358] rounded-md px-4 py-2.5 flex items-center gap-3"
        >
          <div className="text-xl">{s.icon}</div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {s.label}
            </div>
            <div
              className="text-base font-bold tabular-nums"
              style={{ color: s.accent ?? "var(--color-foreground)" }}
            >
              {s.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
