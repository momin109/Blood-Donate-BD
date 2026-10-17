"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { bloodGroups } from "@/data";

export function BloodChips({ label }) {
  const [sel, setSel] = useState(null);
  return (
    <div>
      {label && <p className="label">{label}</p>}
      <div className="grid grid-cols-4 gap-2.5">
        {bloodGroups.map((g) => (
          <button key={g} type="button" onClick={() => setSel(g)} className={cn("h-12 rounded-2xl text-[15px] font-bold transition", sel === g ? "bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-float" : "bg-gray-50 text-ink ring-1 ring-gray-100 hover:bg-brand-50")}>{g}</button>
        ))}
      </div>
    </div>
  );
}
export function Segmented({ label, options, initial = 0, onChange }) {
  const [i, setI] = useState(initial);
  return (
    <div>
      <p className="label">{label}</p>
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-gray-100 p-1">
        {options.map((o, k) => (
          <button key={o} type="button" onClick={() => { setI(k); onChange?.(o); }} className={cn("h-10 rounded-xl text-sm font-semibold transition", i === k ? (k === 0 ? "bg-white shadow-sm" : "bg-brand-600 text-white shadow-sm") : "text-ink-soft")}>{o}</button>
        ))}
      </div>
    </div>
  );
}
