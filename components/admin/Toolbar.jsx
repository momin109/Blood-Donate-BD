"use client";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export const Toolbar = ({ children }) => <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">{children}</div>;

export function SearchBox({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
    </div>
  );
}

export function FilterSelect({ value, onChange, options, label }) {
  return (
    <div className="relative sm:w-44">
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-9 text-sm font-medium focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
        {options.map((o) => <option key={o} value={o}>{o === "All" ? `${label}: All` : o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="scrollbar-hide -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)} className={cn("h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition", value === t ? "bg-brand-600 text-white shadow-float" : "bg-white text-ink-soft ring-1 ring-gray-200 hover:bg-gray-50")}>{t}</button>
      ))}
    </div>
  );
}
