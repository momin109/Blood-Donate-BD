"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/client";

export function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

// সার্ভার-পেজিনেশন সহ তালিকা। filters বদলালে page ১-এ ফেরে; reload() দিয়ে আবার আনা যায়।
export function useAdminList(path, filters, limit = 10) {
  const key = JSON.stringify(filters);
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ items: [], pagination: { page: 1, limit, total: 0, totalPages: 1 }, loading: true, error: "" });
  const seq = useRef(0);

  useEffect(() => setPage(1), [key]);

  const load = useCallback(async () => {
    const mine = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const d = await api(path, { params: { ...JSON.parse(key), page, limit } });
      if (mine === seq.current) setState({ items: d.items, pagination: d.pagination, loading: false, error: "" });
    } catch (e) {
      if (mine === seq.current) setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, [path, key, page, limit]);
  useEffect(() => {
    load();
  }, [load]);

  // শেষ পেজের সব আইটেম মুছে গেলে আগের পেজে যাওয়া
  useEffect(() => {
    if (!state.loading && !state.items.length && page > 1) setPage((p) => p - 1);
  }, [state.loading, state.items.length, page]);

  const p = state.pagination;
  return { ...state, page, setPage, reload: load, server: { page, pages: p.totalPages, total: p.total, pageSize: limit, onChange: setPage } };
}
