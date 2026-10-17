"use client";
import { useRef, useState } from "react";
import { HeartHandshake, ImagePlus, Loader2, X } from "lucide-react";
import { Avatar, Button } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/client";
import { IMAGE_ACCEPT, uploadImage } from "@/lib/image";
import { cn } from "@/lib/cn";

const MAX_IMAGES = 4;
const KINDS = [
  ["general", "সাধারণ পোস্ট", "আপনি কী শেয়ার করতে চান?"],
  ["donate", "Donate Post", "রক্তদাতা হিসেবে আপনার তথ্য ও প্রস্তুতির কথা লিখুন…"],
];

// নতুন পোস্ট: লেখা + ছবি (৪টি পর্যন্ত)। ছবি বাছামাত্র আপলোড হয়, "Post" চাপলে POST /api/posts
export default function PostComposer({ initialKind = "general", onClose, onPosted }) {
  const { user } = useAuth();
  const [kind, setKind] = useState(initialKind);
  const [text, setText] = useState("");
  const [images, setImages] = useState([]); // { key, id?, url?, uploading, error? }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const uploading = images.some((i) => i.uploading);
  const ready = images.filter((i) => i.id);

  async function pick(e) {
    const files = [...e.target.files].slice(0, MAX_IMAGES - images.length);
    e.target.value = "";
    setError("");
    for (const file of files) {
      const key = `${Date.now()}-${Math.random()}`;
      setImages((s) => [...s, { key, uploading: true }]);
      try {
        const d = await uploadImage(file, "post");
        setImages((s) => s.map((i) => (i.key === key ? { key, id: d.id, url: d.url } : i)));
      } catch (err) {
        setImages((s) => s.filter((i) => i.key !== key));
        setError(err.fieldErrors?.file || err.message);
      }
    }
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const d = await api("/api/posts", { method: "POST", body: { kind, text, images: ready.map((i) => i.id) } });
      onPosted?.(d.post);
      onClose();
    } catch (err) {
      setError(err.fieldErrors?.text || err.fieldErrors?.images || err.message);
      setBusy(false);
    }
  }

  const placeholder = KINDS.find((k) => k[0] === kind)[2];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-3xl bg-white p-5 shadow-card sm:rounded-3xl sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">নতুন পোস্ট</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex items-center gap-3">
          <Avatar name={user?.name || "?"} src={user?.photo} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{user?.name}</p>
            <div className="mt-1 grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-0.5 text-xs font-semibold">
              {KINDS.map(([k, label]) => (
                <button key={k} type="button" onClick={() => setKind(k)} className={cn("flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5", kind === k ? "bg-white shadow-sm" : "text-ink-soft")}>
                  {k === "donate" && <HeartHandshake className="h-3.5 w-3.5 text-brand-600" />}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} maxLength={2000} placeholder={placeholder} className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-3.5 text-[15px] focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100" />

        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((i) => (
              <div key={i.key} className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                {i.url && <img src={i.url} alt="" className="h-full w-full object-cover" />}
                {i.uploading && <span className="absolute inset-0 flex items-center justify-center bg-white/70"><Loader2 className="h-5 w-5 animate-spin text-brand-600" /></span>}
                {!i.uploading && (
                  <button type="button" onClick={() => setImages((s) => s.filter((x) => x.key !== i.key))} aria-label="Remove image" className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"><X className="h-3.5 w-3.5" /></button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} multiple hidden onChange={pick} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={images.length >= MAX_IMAGES} className="flex h-10 items-center gap-2 rounded-xl bg-green-50 px-3.5 text-sm font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50">
            <ImagePlus className="h-5 w-5" /> ছবি ({images.length}/{MAX_IMAGES})
          </button>
          <span className="text-xs text-ink-soft">{text.length}/2000</span>
        </div>

        {error && <p role="alert" className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={busy || uploading || (!text.trim() && !ready.length)}>
          {busy ? "পোস্ট হচ্ছে…" : uploading ? "ছবি আপলোড হচ্ছে…" : "Post"}
        </Button>
      </form>
    </div>
  );
}
