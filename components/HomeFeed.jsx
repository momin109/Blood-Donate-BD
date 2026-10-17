"use client";
import { useCallback, useEffect, useState } from "react";
import Composer from "@/components/Composer";
import Feed from "@/components/Feed";
import { Card } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/client";

const LIMIT = 10;

// Home feed: GET /api/posts (পোস্ট তৈরি, মোছা সব এখানেই state-এ মিলে যায়)
export default function HomeFeed() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [pg, setPg] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ads, setAds] = useState([]);

  const load = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    setError("");
    try {
      const d = await api("/api/posts", { params: { page, limit: LIMIT } });
      setPosts((prev) => (append ? [...prev, ...d.items.filter((n) => !prev.some((p) => p.id === n.id))] : d.items));
      setPg(d.pagination);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // login/logout হলে আবার আনা হয়, যাতে like/save/মালিকানা ঠিক থাকে
  useEffect(() => {
    if (!authLoading) load(1, false);
  }, [authLoading, user?.id, load]);

  // চালু বিজ্ঞাপন (Admin থেকে) — না এলে ফিড বিজ্ঞাপন ছাড়াই চলে
  useEffect(() => {
    api("/api/ads").then((d) => setAds(d.items)).catch(() => {});
  }, []);

  return (
    <>
      <Composer onPosted={(p) => setPosts((prev) => [p, ...prev])} />
      {error ? (
        <Card className="p-6 text-center text-sm text-brand-600">
          {error} <button onClick={() => load(1, false)} className="font-bold underline">আবার চেষ্টা করুন</button>
        </Card>
      ) : loading && !posts.length ? (
        <Card className="p-8 text-center text-sm text-ink-soft">পোস্ট লোড হচ্ছে…</Card>
      ) : !posts.length ? (
        <Card className="p-8 text-center text-sm text-ink-soft">এখনও কোনো পোস্ট নেই। প্রথম পোস্টটি আপনিই করুন!</Card>
      ) : (
        <Feed posts={posts} ads={ads} onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))} />
      )}
      {pg.page < pg.totalPages && (
        <button type="button" onClick={() => load(pg.page + 1, true)} disabled={loading} className="mx-auto flex h-12 items-center justify-center rounded-2xl border-2 border-red-600 bg-white px-8 font-bold text-red-600 hover:bg-red-50 disabled:opacity-60">
          {loading ? "লোড হচ্ছে…" : "আরও পোস্ট দেখুন"}
        </button>
      )}
    </>
  );
}
