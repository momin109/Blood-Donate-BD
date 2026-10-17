"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui";

// Slide-over form: full width on mobile, 512px on larger screens. onSubmit receives FormData.
export default function FormDrawer({ open, onClose, title, subtitle, submitLabel = "Save", onSubmit, children }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) setError("");
  }, [open]);
  // onSubmit async হতে পারে: সফল হলে বন্ধ হয়, error (throw) হলে খোলা থাকে ও কারণ দেখায়
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError("");
    try {
      await (onSubmit && onSubmit(new FormData(form)));
      onClose();
    } catch (err) {
      setError(err.errors?.length ? err.errors.map((x) => x.message).join(" · ") : err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <form className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-white shadow-2xl" onSubmit={submit}>
        <div className="flex items-start gap-3 border-b border-gray-100 p-5">
          <div className="min-w-0 flex-1"><h2 className="text-lg font-bold">{title}</h2>{subtitle && <p className="text-sm text-ink-soft">{subtitle}</p>}</div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">{children}</div>
        {error && <p role="alert" className="mx-4 mb-0 mt-3 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{error}</p>}
        <div className="grid grid-cols-2 gap-3 border-t border-gray-100 p-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : submitLabel}</Button>
        </div>
      </form>
    </div>
  );
}
