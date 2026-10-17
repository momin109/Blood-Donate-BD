"use client";
import { useCallback, useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import { Card } from "@/components/ui";
import { api } from "@/lib/client";

// একজনের পোস্ট (?author=) অথবা নিজের Saved পোস্ট (?saved=true)
export default function ProfilePosts({ authorId, saved = false }) {
  const [items, setItems] = useState([]);
  const [pg, setPg] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(
    async (page = 1, append = false) => {
      setLoading(true);
      setError("");
      try {
        const d = await api("/api/posts", { params: saved ? { saved: "true", page, limit: 10 } : { author: authorId, page, limit: 10 } });
        setItems((prev) => (append ? [...prev, ...d.items] : d.items));
        setPg(d.pagination);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [authorId, saved]
  );
  useEffect(() => {
    load(1, false);
  }, [load]);

  if (error) return <Card className="p-8 text-center text-sm text-brand-600">{error}</Card>;
  if (loading && !items.length) return <Card className="p-8 text-center text-sm text-ink-soft">লোড হচ্ছে…</Card>;
  if (!items.length) return <Card className="p-8 text-center text-sm text-ink-soft">{saved ? "কোনো সেভ করা পোস্ট নেই।" : "No posts yet."}</Card>;
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {items.map((p) => (
        <PostCard key={p.id} post={p} onDeleted={(id) => setItems((prev) => prev.filter((x) => x.id !== id))} />
      ))}
      {pg.page < pg.totalPages && (
        <button type="button" onClick={() => load(pg.page + 1, true)} disabled={loading} className="mx-auto flex h-11 items-center justify-center rounded-2xl border-2 border-red-600 bg-white px-6 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-60">
          {loading ? "লোড হচ্ছে…" : "আরও দেখুন"}
        </button>
      )}
    </div>
  );
}
