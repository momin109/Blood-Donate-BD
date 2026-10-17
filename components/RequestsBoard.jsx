"use client";
import { useCallback, useEffect, useState } from "react";
import RequestCard from "@/components/RequestCard";
import RequestForm from "@/components/RequestForm";
import { api } from "@/lib/client";
import { useAuth } from "@/components/AuthProvider";

const LIMIT = 10;

// ফর্ম + সাম্প্রতিক অনুরোধের তালিকা (GET /api/requests, PATCH/DELETE /api/requests/:id)
export default function RequestsBoard() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [pg, setPg] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    setError("");
    try {
      const d = await api("/api/requests", { params: { page, limit: LIMIT } });
      setItems((prev) => (append ? [...prev, ...d.items] : d.items));
      setPg(d.pagination);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // auth নির্ধারিত হলে (এবং login/logout বদলালে) আবার আনা হয়, যাতে contactPhone/isOwner ঠিক থাকে
  useEffect(() => {
    if (!authLoading) load(1, false);
  }, [authLoading, user?.id, load]);

  const onCreated = (request) => setItems((prev) => [request, ...prev.filter((r) => r.id !== request.id)]);

  const fulfill = async (id) => {
    try {
      const d = await api(`/api/requests/${id}`, { method: "PATCH", body: { status: "Fulfilled" } });
      setItems((prev) => prev.map((r) => (r.id === id ? d.request : r)));
    } catch (e) {
      alert(e.message);
    }
  };
  const remove = async (id) => {
    if (!confirm("এই অনুরোধটি মুছে ফেলবেন?")) return;
    try {
      await api(`/api/requests/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <RequestForm onCreated={onCreated} />

      <div className="min-w-0 space-y-4">
        <h2 className="px-1 text-lg font-bold">সাম্প্রতিক অনুরোধ</h2>
        {error ? (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-brand-600 shadow-card">
            {error} <button onClick={() => load(1, false)} className="font-bold underline">আবার চেষ্টা করুন</button>
          </p>
        ) : loading && !items.length ? (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink-soft shadow-card">লোড হচ্ছে…</p>
        ) : !items.length ? (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink-soft shadow-card">এখনও কোনো অনুরোধ নেই।</p>
        ) : (
          items.map((r) => <RequestCard key={r.id} request={r} onFulfill={fulfill} onDelete={remove} />)
        )}
        {pg.page < pg.totalPages && (
          <button type="button" onClick={() => load(pg.page + 1, true)} disabled={loading} className="mx-auto flex h-11 items-center justify-center rounded-2xl border-2 border-red-600 bg-white px-6 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-60">
            {loading ? "লোড হচ্ছে…" : "আরও দেখুন"}
          </button>
        )}
      </div>
    </div>
  );
}
