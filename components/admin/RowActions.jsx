"use client";
import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/cn";

// Row action dropdown. Uses fixed positioning so it is never clipped by scrollable tables.
export default function RowActions({ items }) {
  const [pos, setPos] = useState(null);
  const btn = useRef(null);
  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => { window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  }, [pos]);
  const toggle = () => {
    if (pos) return setPos(null);
    const r = btn.current.getBoundingClientRect();
    const h = items.length * 44 + 12;
    setPos({ right: window.innerWidth - r.right, top: r.bottom + h > window.innerHeight ? r.top - h - 4 : r.bottom + 4 });
  };
  return (
    <>
      <button ref={btn} onClick={toggle} aria-label="Actions" aria-expanded={!!pos} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft hover:bg-gray-100"><MoreVertical className="h-5 w-5" /></button>
      {pos && (
        <>
          <div className="fixed inset-0 z-[70]" onClick={() => setPos(null)} />
          <div className="fixed z-[71] w-48 rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-black/5" style={{ top: pos.top, right: pos.right }}>
            {items.map(([label, Icon, fn, danger]) => (
              <button key={label} onClick={() => { setPos(null); fn && fn(); }} className={cn("flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-surface", danger && "text-brand-700 hover:bg-brand-50")}><Icon className="h-4 w-4" />{label}</button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
