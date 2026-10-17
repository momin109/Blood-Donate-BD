"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/client";
import { timeAgo } from "@/lib/format";

// GET/POST /api/posts/:id/comments, DELETE /api/posts/:id/comments/:commentId
export default function PostComments({ postId, onCount }) {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [pg, setPg] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const d = await api(`/api/posts/${postId}/comments`, { params: { page, limit: 20 } });
      setItems((prev) => (page === 1 ? d.items : [...prev, ...d.items]));
      setPg(d.pagination);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load(1);
  }, [postId, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function send(e) {
    e.preventDefault();
    if (!user) return router.push("/login");
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    try {
      const d = await api(`/api/posts/${postId}/comments`, { method: "POST", body: { text } });
      setItems((prev) => [...prev, d.comment]);
      setText("");
      onCount?.(d.comments);
    } catch (err) {
      setError(err.fieldErrors?.text || err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    try {
      const d = await api(`/api/posts/${postId}/comments/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((c) => c.id !== id));
      onCount?.(d.comments);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-3 px-4 pt-3 sm:px-5">
      {loading && !items.length && <p className="text-sm text-ink-soft">লোড হচ্ছে…</p>}
      {!loading && !items.length && !error && <p className="text-sm text-ink-soft">এখনও কোনো কমেন্ট নেই। প্রথম কমেন্টটি আপনিই করুন।</p>}
      {items.map((c) => (
        <div key={c.id} className="flex gap-2.5">
          <Avatar name={c.author?.name || "?"} src={c.author?.photo} size="sm" />
          <div className="min-w-0 rounded-2xl bg-surface px-3.5 py-2 text-sm">
            <div className="flex items-center gap-2">
              {c.author ? (
                <Link href={`/donors/${c.author.id}`} className="truncate font-semibold hover:underline">{c.author.name}</Link>
              ) : (
                <span className="font-semibold">অজানা ব্যবহারকারী</span>
              )}
              <span className="shrink-0 text-xs text-ink-soft">{timeAgo(c.createdAt)}</span>
              {c.canDelete && (
                <button onClick={() => remove(c.id)} aria-label="Delete comment" className="ml-auto shrink-0 text-gray-400 hover:text-brand-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="break-words">{c.text}</p>
          </div>
        </div>
      ))}
      {pg.page < pg.totalPages && (
        <button onClick={() => load(pg.page + 1)} disabled={loading} className="text-sm font-semibold text-brand-600 hover:underline disabled:opacity-60">
          আরও কমেন্ট দেখুন
        </button>
      )}
      <form onSubmit={send} className="flex items-center gap-2.5">
        <Avatar name={user?.name || "?"} src={user?.photo} size="sm" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          className="h-10 min-w-0 flex-1 rounded-full bg-surface px-4 text-sm focus:ring-2 focus:ring-brand-200"
          placeholder={user ? "Write a comment..." : "কমেন্ট করতে লগইন করুন"}
          onFocus={() => !user && router.push("/login")}
        />
        <button type="submit" disabled={busy} aria-label="Send" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white disabled:opacity-60">
          <Send className="h-4 w-4" />
        </button>
      </form>
      {error && <p className="text-xs text-brand-600">{error}</p>}
    </div>
  );
}
