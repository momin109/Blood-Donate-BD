"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, ChevronLeft, ChevronRight, Crown, Droplet, Info, Star, Trophy } from "lucide-react";
import { Avatar, BloodBadge, Card, Empty } from "@/components/ui";
import RankBadge from "@/components/RankBadge";
import { useAuth } from "@/components/AuthProvider";
import { BADGES, gradientOf } from "@/lib/badges";
import { api } from "@/lib/client";
import { formatNumber as bn } from "@/lib/format";
import { cn } from "@/lib/cn";

// ---- মঞ্চের একটি জায়গা (১ম মাঝে বড়, ২য় বামে, ৩য় ডানে) ----
const AV = {
  1: "[&>span:first-child]:!h-20 [&>span:first-child]:!w-20 sm:[&>span:first-child]:!h-24 sm:[&>span:first-child]:!w-24 [&>span:first-child]:!text-3xl",
  2: "[&>span:first-child]:!h-14 [&>span:first-child]:!w-14 sm:[&>span:first-child]:!h-[72px] sm:[&>span:first-child]:!w-[72px]",
  3: "[&>span:first-child]:!h-14 [&>span:first-child]:!w-14 sm:[&>span:first-child]:!h-[72px] sm:[&>span:first-child]:!w-[72px]",
};
function Podium({ d, place }) {
  const b = BADGES[d.badge];
  const first = place === 1;
  return (
    <Link href={`/donors/${d.id}`} className={cn("flex min-w-0 flex-1 flex-col items-center", first ? "" : "pt-8 sm:pt-10")}>
      <Crown className={first ? "h-9 w-9 sm:h-11 sm:w-11" : "h-7 w-7 sm:h-8 sm:w-8"} style={{ color: b.from, filter: "drop-shadow(0 2px 3px rgba(0,0,0,.35))" }} fill={b.from} />
      <span className="relative z-10 -mb-5 rounded-full p-[3px] shadow-lg" style={{ background: gradientOf(d.badge) }}>
        <Avatar name={d.name} src={d.photo} className={cn("rounded-full ring-2 ring-white", AV[place])} />
      </span>
      <div className={cn("w-full rounded-t-2xl px-1.5 text-center shadow-lg", first ? "pb-5 pt-8" : "pb-4 pt-7")} style={{ background: gradientOf(d.badge), color: b.ink }}>
        <p className="line-clamp-2 break-words text-[13px] font-extrabold leading-tight sm:text-base">{d.name}</p>
        <p className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-semibold sm:text-sm">
          <Droplet className="h-3 w-3 shrink-0" fill="currentColor" />
          {bn(d.donations)} দান
        </p>
        <p className="flex items-center justify-center gap-1 text-[11px] font-semibold sm:text-sm">
          <Star className="h-3 w-3 shrink-0" />
          {bn(d.score)} স্কোর
        </p>
        <p className="mt-1.5 text-[11px] font-extrabold sm:text-sm">{b.bn}</p>
      </div>
    </Link>
  );
}

// ৪–১০ নম্বরের সারি
function Row({ d }) {
  return (
    <li>
      <Link href={`/donors/${d.id}`} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-card transition hover:border-brand-200">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-brand-500 to-brand-700 text-sm font-extrabold text-white shadow-sm">{bn(d.rank)}</span>
        <Avatar name={d.name} src={d.photo} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 font-bold">
            <span className="truncate">{d.name}</span>
            {d.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-blue-500" aria-label="Verified" />}
          </p>
          <p className="truncate text-sm text-ink-soft">
            {bn(d.donations)} দান • {bn(d.score)} স্কোর
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <BloodBadge group={d.bloodGroup} size="sm" />
          <RankBadge badge="top10" />
        </div>
      </Link>
    </li>
  );
}

const RULES = [
  "প্রতিটি অনুমোদিত রক্তদান = ৫০ পয়েন্ট",
  "গত ৬ মাসের মধ্যে দিলে প্রতি দানে আরও +২০",
  "রিসিভারের গড় রেটিং × ১০ (৫ স্টার = ৫০ পয়েন্ট)",
  "১ ঘণ্টার মধ্যে রিপ্লাই +২০, কল রিসিভ +১০ (প্রতি দানে)",
  "NID ও ফোন দুটোই ভেরিফাইড হলে +৩০",
  "প্রতিটি দান অ্যাডমিন অনুমোদন করে; একই হাসপাতালে ৩ মাসের আগে আরেকটি দান গোনা হয় না",
];

// দেখানোর অংশ আলাদা (data দিলেই আঁকে) — fetch নেই
export function LeaderboardView({ items, me, user }) {
  const top = (n) => items.find((x) => x.rank === n);
  const rest = items.filter((x) => x.rank >= 4);
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/" aria-label="হোমে ফিরুন" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-float">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="text-2xl font-extrabold leading-tight text-brand-700 sm:text-3xl">শীর্ষ দাতা লিডারবোর্ড</h1>
          <p className="text-sm font-medium text-brand-600">শীর্ষ ১০ রক্তদাতা • প্রতি রাতে আপডেট</p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-500">
          <Trophy className="h-6 w-6" />
        </span>
      </div>

      {/* Podium */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-600 to-brand-500 px-3 pt-5 shadow-card sm:px-8">
        <span className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/10" />
        <span className="absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-black/10" />
        <Droplet className="absolute left-4 top-4 h-6 w-6 text-amber-300/70" fill="currentColor" />
        <Droplet className="absolute right-5 top-6 h-5 w-5 text-amber-300/70" fill="currentColor" />
        <div className="relative flex items-end gap-2 sm:gap-4">
          {top(2) ? <Podium d={top(2)} place={2} /> : <span className="flex-1" />}
          {top(1) ? <Podium d={top(1)} place={1} /> : <span className="flex-1" />}
          {top(3) ? <Podium d={top(3)} place={3} /> : <span className="flex-1" />}
        </div>
      </section>

      {/* ৪–১০ */}
      <Card className="space-y-3 p-3 sm:p-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-extrabold text-brand-700">শীর্ষ ১০ দাতা</h2>
          <Link href="/donors" className="flex items-center text-sm font-semibold text-amber-600">
            ডোনার দেখুন <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {rest.length ? <ul className="space-y-2.5">{rest.map((d) => <Row key={d.id} d={d} />)}</ul> : <p className="px-1 py-3 text-sm text-ink-soft">{items.length ? "৪র্থ থেকে ১০ম স্থানে এখনও কেউ নেই।" : ""}</p>}
      </Card>

      {/* আমার অবস্থান */}
      {user && (
        <Card className="flex items-center gap-3 p-4">
          <Avatar name={user.name} src={user.photo} />
          <div className="min-w-0 flex-1">
            <p className="font-bold">আপনার অবস্থান</p>
            <p className="text-sm text-ink-soft">{me ? `#${bn(me.rank)} • ${bn(me.donations)} দান • ${bn(me.score)} স্কোর` : "অনুমোদিত রক্তদান জমা হলে র‍্যাংকে যুক্ত হবেন"}</p>
          </div>
          {me ? <RankBadge badge={me.badge} /> : null}
          <Link href="/donations" className="shrink-0 rounded-full bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100">
            রক্তদান জমা
          </Link>
        </Card>
      )}

      <details className="group rounded-3xl bg-white p-4 shadow-card">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-bold">
          <Info className="h-5 w-5 text-brand-600" />
          স্কোর কীভাবে হিসাব হয়?
          <ChevronRight className="ml-auto h-4 w-4 transition group-open:rotate-90" />
        </summary>
        <ul className="mt-3 list-disc space-y-1.5 pl-6 text-sm text-ink-soft">
          {RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api("/api/leaderboard", { params: { limit: 10 } })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [user?.id]); // লগইন বদলালে "আমার অবস্থান"-ও বদলায়

  if (error) return <Card className="mx-auto max-w-md p-6 text-center text-sm text-brand-700">{error}</Card>;
  if (!data) return <p className="py-20 text-center text-sm text-ink-soft">লোড হচ্ছে…</p>;
  if (!data.items.length) {
    return (
      <Card className="mx-auto max-w-md p-6">
        <Empty icon={Trophy} title="এখনও কেউ র‍্যাংকে নেই" hint="অনুমোদিত রক্তদান জমা হলে এখানে শীর্ষ ডোনারদের তালিকা দেখা যাবে।" />
        <Link href="/donations" className="mt-2 block rounded-2xl bg-gradient-to-b from-brand-500 to-brand-700 py-3 text-center font-semibold text-white shadow-float">
          রক্তদান জমা দিন
        </Link>
      </Card>
    );
  }
  return <LeaderboardView items={data.items} me={data.me} user={user} />;
}
