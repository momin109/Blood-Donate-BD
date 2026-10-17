"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

// শুধু দেখার জন্য slide-over। rows: [[label, value]]
export default function DetailsDrawer({ open, onClose, title, subtitle, rows = [], children }) {
  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-start gap-3 border-b border-gray-100 p-5">
          <div className="min-w-0 flex-1"><h2 className="text-lg font-bold">{title}</h2>{subtitle && <p className="text-sm text-ink-soft">{subtitle}</p>}</div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {children}
          {rows.length > 0 && (
            <dl className="divide-y divide-gray-100 rounded-2xl bg-surface text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="flex gap-3 px-4 py-3"><dt className="w-32 shrink-0 text-ink-soft">{k}</dt><dd className="min-w-0 break-words font-medium">{v ?? "—"}</dd></div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
