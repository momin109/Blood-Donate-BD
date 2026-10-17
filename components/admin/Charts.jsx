export function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d[1]));
  return (
    <div className="flex h-52 items-end gap-2 sm:gap-4">
      {data.map(([label, v], i) => (
        <div key={label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2" title={`${label}: ${v}`}>
          <span className="text-[10px] font-semibold text-ink-soft sm:text-xs">{v}</span>
          <div className={"w-full max-w-12 rounded-t-xl " + (i === data.length - 1 ? "bg-gradient-to-t from-brand-700 to-brand-500" : "bg-brand-100")} style={{ height: `${(v / max) * 80}%` }} />
          <span className="text-[11px] text-ink-soft sm:text-xs">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function DistributionBars({ data }) {
  const max = Math.max(...data.map((d) => d[1]));
  return (
    <ul className="space-y-3">
      {data.map(([g, v]) => (
        <li key={g} className="flex items-center gap-3">
          <span className="w-9 shrink-0 text-sm font-bold text-brand-700">{g}</span>
          <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100"><span className="block h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${(v / max) * 100}%` }} /></span>
          <span className="w-12 shrink-0 text-right text-xs text-ink-soft">{v.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}
