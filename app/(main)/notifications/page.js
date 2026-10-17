"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BellOff, Loader2, LogIn } from "lucide-react";
import { Button, Card, Empty } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import NotificationItem from "@/components/NotificationItem";
import PushToggle from "@/components/PushToggle";
import { NOTIFICATIONS_READ_EVENT } from "@/components/NotificationBell";
import { api } from "@/lib/client";

const PAGE = 15;

export default function Notifications() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [error, setError] = useState("");
  const marked = useRef(false);

  // GET /api/notifications — প্রথম লোডে unread চিহ্ন দেখিয়ে পরে "পড়া হয়েছে" করা হয়
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const d = await api("/api/notifications", { params: { limit: PAGE } });
      setItems(d.items);
      setHasMore(d.hasMore);
      if (d.unreadCount > 0 && !marked.current) {
        marked.current = true;
        api("/api/notifications", { method: "PATCH" })
          .then(() => window.dispatchEvent(new Event(NOTIFICATIONS_READ_EVENT)))
          .catch(() => (marked.current = false));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading, load]);

  const loadMore = async () => {
    setMore(true);
    try {
      const d = await api("/api/notifications", { params: { limit: PAGE, before: items[items.length - 1]?.createdAt } });
      setItems((cur) => [...cur, ...d.items]);
      setHasMore(d.hasMore);
    } catch (e) {
      setError(e.message);
    } finally {
      setMore(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-3">
      <h1 className="px-1 text-lg font-bold">নোটিফিকেশন</h1>

      {!authLoading && !user ? (
        <Card>
          <Empty icon={LogIn} title="লগইন করুন" hint="নোটিফিকেশন দেখতে ও Push চালু করতে আগে লগইন করুন।" />
          <div className="px-4 pb-6 text-center">
            <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-b from-brand-500 to-brand-700 px-6 text-sm font-semibold text-white shadow-float">
              লগইন
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {user && <PushToggle />}

          {error && (
            <div role="alert" className="flex flex-col gap-3 rounded-2xl bg-brand-50 p-4 text-sm text-brand-700 sm:flex-row sm:items-center sm:justify-between">
              <p className="break-words">{error}</p>
              <Button size="sm" variant="outline" onClick={load}>আবার চেষ্টা করুন</Button>
            </div>
          )}

          {loading || authLoading ? (
            <Card className="divide-y divide-gray-100 overflow-hidden" aria-busy="true">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-4">
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-1/4 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </Card>
          ) : !items.length && !error ? (
            <Card><Empty icon={BellOff} title="কোনো নোটিফিকেশন নেই" hint="নতুন কিছু হলে এখানে দেখতে পাবেন।" /></Card>
          ) : (
            items.length > 0 && (
              <Card className="divide-y divide-gray-100 overflow-hidden">
                {items.map((n) => <NotificationItem key={n.id} n={n} />)}
              </Card>
            )
          )}

          {hasMore && !loading && (
            <Button variant="outline" onClick={loadMore} disabled={more} className="w-full">
              {more && <Loader2 className="h-4 w-4 animate-spin" />}
              আরও দেখুন
            </Button>
          )}
        </>
      )}
    </div>
  );
}
