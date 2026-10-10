"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Droplet, HeartHandshake, ShieldCheck, Users, CheckCircle2, Heart } from "lucide-react";

const icons = { Droplet, HeartHandshake, ShieldCheck, Users, CheckCircle2, Heart };
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

const bg = ["from-brand-500 via-brand-600 to-brand-800", "from-rose-600 via-brand-700 to-brand-900", "from-brand-600 via-brand-800 to-neutral-900"];

export default function HeroSlider({ slides, compact }) {
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
    <div className="group relative overflow-hidden rounded-[2rem] shadow-float" onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}
      onTouchStart={(e) => (x0.current = e.touches[0].clientX)}
      onTouchEnd={(e) => { if (x0.current == null) return; const dx = e.changedTouches[0].clientX - x0.current; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0.current = null; }}>
      <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s, k) => {
          const Icon = icons[s.icon];
          return (
            <div key={k} className={cn("relative min-w-full overflow-hidden bg-gradient-to-br px-5 pb-12 pt-6 text-white sm:px-9 sm:pt-9", bg[k % 3], compact ? "min-h-[210px]" : "min-h-[330px]")}>
              <span className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/10" />
              <span className="absolute -bottom-20 right-16 h-44 w-44 rounded-full bg-black/10" />
              <Icon className="absolute -right-4 bottom-4 h-40 w-40 text-white/10 sm:right-10 sm:h-52 sm:w-52" strokeWidth={1.2} />
              <div className="relative max-w-lg">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold backdrop-blur sm:text-sm">{s.tag}</span>
                <h2 className={cn("mt-4 font-extrabold leading-tight", compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl")}>{s.title}<br /><span className="text-yellow-300">{s.accent}</span></h2>
                <p className="mt-2.5 text-sm text-white/85">{s.text}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {s.cta.map((c, j) => <Link key={c.label} href={c.href}><Button variant={j === 0 ? "white" : "glass"} size="md">{c.label}</Button></Link>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={() => go(i - 1)} aria-label="Previous" className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30 sm:flex"><ChevronLeft className="h-5 w-5" /></button>
      <button onClick={() => go(i + 1)} aria-label="Next" className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30 sm:flex"><ChevronRight className="h-5 w-5" /></button>
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
        {slides.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={cn("h-1.5 rounded-full bg-white transition-all", k === i ? "w-6" : "w-1.5 opacity-50")} />)}
      </div>
    </div>
  );
}
