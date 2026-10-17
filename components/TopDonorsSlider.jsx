"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Crown, Droplet, Star, Trophy } from "lucide-react";
import { Avatar } from "@/components/ui";
import { BADGES, gradientOf } from "@/lib/badges";
import { api } from "@/lib/client";
import { formatNumber as bn } from "@/lib/format";

// Home page: Top ৩ ডোনারের Featured slider (আঙুলে/মাউসে পাশে সরানো যায়)
export function TopDonorsSliderView({ items }) {
  return (
    <section aria-label="শীর্ষ রক্তদাতা">
      <div className="mb-2 flex items-center gap-2 px-1">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h2 className="flex-1 text-lg font-bold">শীর্ষ রক্তদাতা</h2>
        <Link href="/top-donors" className="flex items-center text-sm font-semibold text-brand-600 hover:underline">
          সব দেখুন <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        {items.map((d) => {
          const b = BADGES[d.badge];
          return (
            <Link
              key={d.id}
              href={`/donors/${d.id}`}
              style={{ background: gradientOf(d.badge), color: b.ink }}
              className="relative min-w-[78%] snap-center overflow-hidden rounded-3xl p-4 shadow-card sm:min-w-[calc(33.333%-0.5rem)] sm:flex-1"
            >
              <Droplet className="absolute -right-3 -top-3 h-24 w-24 opacity-15" fill="currentColor" />
              <div className="relative flex items-center gap-3">
                <span className="rounded-full bg-white/70 p-[3px] shadow">
                  <Avatar name={d.name} src={d.photo} size="lg" className="rounded-full" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 text-xs font-extrabold">
                    <Crown className="h-4 w-4" fill="currentColor" />
                    {b.title}
                  </p>
                  <p className="truncate text-lg font-extrabold leading-tight">{d.name}</p>
                  <p className="mt-0.5 text-xs font-semibold">{d.district}</p>
                </div>
                <span className="shrink-0 rounded-md bg-white/85 px-2 py-0.5 text-sm font-extrabold text-brand-700">{d.bloodGroup}</span>
              </div>
              <div className="relative mt-3 flex items-center gap-4 text-sm font-bold">
                <span className="flex items-center gap-1"><Droplet className="h-4 w-4" fill="currentColor" />{bn(d.donations)} দান</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4" />{bn(d.score)} স্কোর</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function TopDonorsSlider() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api("/api/leaderboard", { params: { limit: 3 } })
      .then((d) => setItems(d.items))
      .catch(() => {}); // না এলে Home-এর বাকি অংশ যেমন আছে তেমনই থাকবে
  }, []);
  if (!items.length) return null;
  return <TopDonorsSliderView items={items} />;
}
