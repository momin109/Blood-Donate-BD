import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export default function Pagination({ page, pages, total, pageSize, onChange }) {
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, total);
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  const btn = "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition disabled:opacity-40";
  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-sm text-ink-soft sm:text-left">Showing <b className="text-ink">{from}–{to}</b> of <b className="text-ink">{total}</b></p>
      <div className="flex items-center justify-center gap-1.5">
        <button className={cn(btn, "bg-surface hover:bg-gray-200")} disabled={page === 1} onClick={() => onChange(page - 1)}><ChevronLeft className="h-4 w-4" /><span className="hidden sm:inline">Prev</span></button>
        <span className="px-3 text-sm text-ink-soft sm:hidden">Page {page} / {pages}</span>
        <div className="hidden items-center gap-1.5 sm:flex">
          {nums.map((n, i) => (
            <span key={n} className="flex items-center gap-1.5">
              {i > 0 && n - nums[i - 1] > 1 && <span className="text-gray-400">…</span>}
              <button onClick={() => onChange(n)} className={cn(btn, n === page ? "bg-brand-600 text-white shadow-sm" : "bg-surface hover:bg-gray-200")}>{n}</button>
            </span>
          ))}
        </div>
        <button className={cn(btn, "bg-surface hover:bg-gray-200")} disabled={page === pages} onClick={() => onChange(page + 1)}><span className="hidden sm:inline">Next</span><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
