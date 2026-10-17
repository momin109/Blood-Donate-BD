"use client";
import { useEffect, useRef } from "react";
import { Megaphone, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui";
import { AD_TONES } from "@/lib/constants";
import { api } from "@/lib/client";

// Admin-এর তৈরি বিজ্ঞাপন (GET /api/ads)। স্ক্রিনে এলে একবার view, ক্লিকে click গোনা হয় (POST /api/ads/:id/track)।
export default function AdCard({ ad }) {
  const ref = useRef(null);
  const seen = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !seen.current) {
          seen.current = true;
          api(`/api/ads/${ad.id}/track`, { method: "POST", body: { type: "impression" } }).catch(() => {});
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ad.id]);

  return (
    <Card className="overflow-hidden">
      <div ref={ref} className="flex items-center justify-between px-4 pt-4 sm:px-5">
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Sponsored</span>
        <Megaphone className="h-4 w-4 text-gray-300" />
      </div>
      <div className={`m-3 flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-br ${AD_TONES[ad.tone] || AD_TONES.brand} p-4 text-white sm:m-4 sm:p-6`}>
        <div className="min-w-0">
          <p className="text-lg font-extrabold leading-tight sm:text-xl">{ad.title}</p>
          {ad.text && <p className="mt-1 text-sm text-white/85">{ad.text}</p>}
        </div>
        <a
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => api(`/api/ads/${ad.id}/track`, { method: "POST", body: { type: "click" } }).catch(() => {})}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-semibold text-ink"
        >
          {ad.cta}
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </Card>
  );
}
