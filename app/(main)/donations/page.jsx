"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, LogIn, Trophy } from "lucide-react";
import { Button, Card, Empty, Field, Status, statusTone } from "@/components/ui";
import RankBadge from "@/components/RankBadge";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/client";
import { formatDate, formatNumber as bn } from "@/lib/format";

const LABEL = { Pending: "অপেক্ষমাণ", Approved: "অনুমোদিত", Rejected: "বাতিল" };

// আমার রক্তদান: নতুন দান জমা দেওয়া (Admin অনুমোদন করলে র‍্যাংকে গোনা হয়) + আগের তালিকা
export default function MyDonationsPage() {
  const { user, loading } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [f, setF] = useState({ hospital: "", donatedAt: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(() => api("/api/donations").then(setData).catch((e) => setError(e.message)), []);
  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setError("");
    setDone(false);
    try {
      await api("/api/donations", { method: "POST", body: f });
      setF({ hospital: "", donatedAt: "" });
      setDone(true);
      load();
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length) setErrors(err.fieldErrors);
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="py-20 text-center text-sm text-ink-soft">লোড হচ্ছে…</p>;
  if (!user) {
    return (
      <Card className="mx-auto max-w-md p-6">
        <Empty icon={ClipboardCheck} title="রক্তদান জমা দিতে লগইন করুন" hint="অনুমোদিত দান আপনাকে শীর্ষ দাতা র‍্যাংকিংয়ে নিয়ে যাবে।" />
        <Link href="/login" className="mt-2 block"><Button className="w-full"><LogIn className="h-4 w-4" />Login</Button></Link>
      </Card>
    );
  }
  const s = data?.summary;
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="px-1 text-2xl font-extrabold">আমার রক্তদান</h1>

      <Card className="flex items-center gap-3 p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500"><Trophy className="h-6 w-6" /></span>
        <div className="min-w-0 flex-1">
          {s?.rank ? (
            <>
              <p className="font-bold">র‍্যাংক #{bn(s.rank)} • {bn(s.score)} স্কোর</p>
              <p className="text-sm text-ink-soft">{bn(s.donations)}টি অনুমোদিত দান{s.avgRating ? ` • গড় রেটিং ${bn(s.avgRating)}` : ""}</p>
            </>
          ) : (
            <>
              <p className="font-bold">এখনও র‍্যাংকে নেই</p>
              <p className="text-sm text-ink-soft">দান অনুমোদিত হলে লিডারবোর্ডে যুক্ত হবেন</p>
            </>
          )}
        </div>
        {s?.rank ? <RankBadge badge={s.badge} /> : null}
        <Link href="/top-donors" className="shrink-0 rounded-full bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100">লিডারবোর্ড</Link>
      </Card>

      <Card className="p-4 sm:p-5">
        <p className="mb-3 text-lg font-bold">নতুন রক্তদান জমা দিন</p>
        <form onSubmit={submit} className="space-y-3">
          <Field label="হাসপাতালের নাম" required placeholder="যেমন: ঢাকা মেডিকেল কলেজ হাসপাতাল" maxLength={150} value={f.hospital} onChange={(e) => setF({ ...f, hospital: e.target.value })} error={errors.hospital} />
          <Field label="রক্তদানের তারিখ" required type="date" max={today} value={f.donatedAt} onChange={(e) => setF({ ...f, donatedAt: e.target.value })} error={errors.donatedAt} />
          {error && <p role="alert" className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{error}</p>}
          {done && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">জমা হয়েছে। অ্যাডমিন অনুমোদন করলে র‍্যাংকে গোনা হবে।</p>}
          <Button type="submit" className="w-full" disabled={busy || !f.hospital.trim() || !f.donatedAt}>{busy ? "জমা হচ্ছে…" : "জমা দিন"}</Button>
          <p className="text-xs text-ink-soft">একই হাসপাতালে ৩ মাসের মধ্যে আরেকটি দান জমা বা গোনা হয় না।</p>
        </form>
      </Card>

      <Card className="p-2 sm:p-3">
        <p className="px-3 pb-1 pt-3 text-lg font-bold">জমা দেওয়া দান</p>
        {!data && !error && <p className="px-3 py-6 text-center text-sm text-ink-soft">লোড হচ্ছে…</p>}
        {data && !data.items.length && <p className="px-3 py-6 text-center text-sm text-ink-soft">এখনও কোনো রক্তদান জমা দেননি।</p>}
        <ul>
          {data?.items.map((d) => (
            <li key={d.id} className="flex items-start gap-3 rounded-2xl px-3 py-3 hover:bg-surface">
              <div className="min-w-0 flex-1">
                <p className="break-words font-semibold">{d.hospital}</p>
                <p className="text-sm text-ink-soft">{formatDate(d.donatedAt)}{d.rating ? ` • রেটিং ${bn(d.rating)}/৫` : ""}</p>
                {d.note && <p className="mt-0.5 text-xs text-brand-700">কারণ: {d.note}</p>}
              </div>
              <Status tone={statusTone[d.status]}>{LABEL[d.status] || d.status}</Status>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
