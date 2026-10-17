"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Droplet, HeartHandshake, ShieldCheck, Users, CheckCircle2, Heart, Siren } from "lucide-react";
import { cn } from "@/lib/cn";

const icons = { Droplet, HeartHandshake, ShieldCheck, Users, CheckCircle2, Heart, Siren };
const bg = ["from-brand-500 via-brand-600 to-brand-800", "from-rose-600 via-brand-700 to-brand-900", "from-brand-600 via-brand-800 to-neutral-900"];
const cta = "inline-flex h-9 items-center rounded-xl px-4 text-[13px] font-semibold transition sm:h-11 sm:rounded-2xl sm:px-5 sm:text-sm";

// Wide, low-height banner (mobile-friendly). `compact` prop kept for backward compatibility.
export default function HeroSlider({ slides }) {
  const [i, setI] = useState(0);
  const [pause, setPause] = useState(false);
  const x0 = useRef(null);
  const n = slides.length;
  const go = (k) => setI((k + n) % n);
  useEffect(() => {
    if (pause) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), 5000);
    return () => clearInterval(t);
  }, [pause, n]);

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-float sm:rounded-[2rem]" onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}
      onTouchStart={(e) => (x0.current = e.touches[0].clientX)}
      onTouchEnd={(e) => { if (x0.current == null) return; const dx = e.changedTouches[0].clientX - x0.current; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0.current = null; }}>
      <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s, k) => {
          const Icon = icons[s.icon] || Droplet;
          return (
            <div key={k} className={cn("relative flex min-h-[160px] min-w-full items-center overflow-hidden bg-gradient-to-br px-4 pb-8 pt-4 text-white sm:min-h-[230px] sm:px-10 sm:pb-12 sm:pt-8 lg:min-h-[260px]", bg[k % 3])}>
              <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 sm:h-52 sm:w-52" />
              <span className="absolute -bottom-12 right-10 h-28 w-28 rounded-full bg-black/10 sm:h-44 sm:w-44" />
              <Icon className="absolute right-2 top-1/2 h-24 w-24 -translate-y-1/2 text-white/10 sm:right-12 sm:h-48 sm:w-48" strokeWidth={1.2} />
              <div className="relative max-w-[85%] sm:max-w-lg">
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold backdrop-blur sm:text-sm">{s.tag}</span>
                <h2 className="mt-2 text-xl font-extrabold leading-tight sm:mt-4 sm:text-3xl lg:text-4xl">{s.title} <span className="text-yellow-300">{s.accent}</span></h2>
                <p className="mt-2 hidden text-sm text-white/85 sm:block">{s.text}</p>
                <div className="mt-3 flex flex-wrap gap-2 sm:mt-5 sm:gap-3">
                  {s.cta.map((c, j) => <Link key={c.label} href={c.href} className={cn(cta, j === 0 ? "bg-white text-brand-700 shadow-sm hover:bg-brand-50" : "border border-white/30 bg-white/10 text-white hover:bg-white/20")}>{c.label}</Link>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={() => go(i - 1)} aria-label="Previous" className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30 sm:flex"><ChevronLeft className="h-5 w-5" /></button>
      <button onClick={() => go(i + 1)} aria-label="Next" className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30 sm:flex"><ChevronRight className="h-5 w-5" /></button>
      <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5 sm:bottom-3">
        {slides.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={cn("h-1.5 rounded-full bg-white transition-all", k === i ? "w-6" : "w-1.5 opacity-50")} />)}
      </div>
    </div>
  );
}
