"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BellOff } from "lucide-react";
import { Empty } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import NotificationItem from "@/components/NotificationItem";
import PushToggle from "@/components/PushToggle";
import { api } from "@/lib/client";
import { syncPush } from "@/lib/push-client";

const BTN = "relative flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink-soft hover:bg-gray-200";
export const NOTIFICATIONS_READ_EVENT = "bdbd:notifications-read"; // /notifications পেজ পড়া শেষ করলে bell-কে জানায়

// Header-এর Notification bell: unread সংখ্যা + dropdown (মোবাইলে পূর্ণ-প্রস্থ, বড় screen-এ ৩৮০px)
export default function NotificationBell() {
  const { user, loading: authLoading } = useAuth();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [list, setList] = useState({ items: [], loading: false, error: "" });
  const wrap = useRef(null);
  const openRef = useRef(false);
  openRef.current = open;

  const refreshCount = useCallback(async () => {
    try {
      const d = await api("/api/notifications", { params: { limit: 1 } });
      setUnread(d.unreadCount);
    } catch {}
  }, []);

  const loadList = useCallback(async () => {
    setList((s) => ({ ...s, loading: true, error: "" }));
    try {
      const d = await api("/api/notifications", { params: { limit: 8 } });
      setList({ items: d.items, loading: false, error: "" });
      if (d.unreadCount > 0) {
        // তালিকায় unread চিহ্ন থেকে যাবে (এই session-এ), কিন্তু bell-এর সংখ্যা শূন্য হবে
        api("/api/notifications", { method: "PATCH" }).catch(() => {});
        setUnread(0);
      }
    } catch (e) {
      setList((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, []);

  // Login থাকলে: Push subscription জোড়া + unread গোনা (প্রতি ৬০ সেকেন্ডে, tab ফোকাসে, আর Push এলে)
  useEffect(() => {
    if (!user) return;
    syncPush();
    refreshCount();
    const tick = () => document.visibilityState === "visible" && refreshCount();
    const timer = setInterval(tick, 60000);
    const onMsg = (e) => {
      if (e.data?.type !== "notification:new") return;
      refreshCount();
      if (openRef.current) loadList();
    };
    const onRead = () => setUnread(0);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener(NOTIFICATIONS_READ_EVENT, onRead);
    navigator.serviceWorker?.addEventListener("message", onMsg);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener(NOTIFICATIONS_READ_EVENT, onRead);
      navigator.serviceWorker?.removeEventListener("message", onMsg);
    };
  }, [user, refreshCount, loadList]);

  // বাইরে ক্লিক / Esc / পেজ বদলালে বন্ধ
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const away = (e) => wrap.current && !wrap.current.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("touchstart", away, { passive: true });
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("touchstart", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  // Login না থাকলে আগের মতোই /notifications-এ যায় (সেখানে login-এর প্রস্তাব দেখায়)
  if (authLoading || !user) {
    return (
      <Link href="/notifications" aria-label="নোটিফিকেশন" className={BTN}>
        <Bell className="h-5 w-5" />
      </Link>
    );
  }

  const toggle = () => {
    if (!open) loadList();
    setOpen(!open);
  };

  return (
    // sm-এর নিচে wrapper positioned নয় → panel পুরো header-এর প্রস্থ নেয়; sm+ এ bell-এর নিচে ডানে বসে
    <div ref={wrap} className="sm:relative">
      <button type="button" onClick={toggle} aria-label="নোটিফিকেশন" aria-haspopup="dialog" aria-expanded={open} className={BTN}>
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label="নোটিফিকেশন" className="absolute inset-x-3 top-full z-40 mt-2 flex max-h-[min(70vh,560px)] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 sm:inset-x-auto sm:right-0 sm:mt-3 sm:w-[380px]">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <p className="text-base font-bold">নোটিফিকেশন</p>
            <Link href="/notifications" className="text-sm font-semibold text-brand-600 hover:underline">
              সব দেখুন
            </Link>
          </div>
          <PushToggle variant="inline" />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {list.loading && !list.items.length ? (
              <div className="divide-y divide-gray-100" aria-busy="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-3 p-4">
                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-2/3 animate-pulse rounded bg-gray-100" />
                      <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : list.error ? (
              <div className="p-6 text-center">
                <p className="text-sm text-brand-700">{list.error}</p>
                <button type="button" onClick={loadList} className="mt-3 text-sm font-semibold text-brand-600 hover:underline">
                  আবার চেষ্টা করুন
                </button>
              </div>
            ) : !list.items.length ? (
              <Empty icon={BellOff} title="কোনো নোটিফিকেশন নেই" hint="নতুন কিছু হলে এখানে দেখতে পাবেন।" />
            ) : (
              <div className="divide-y divide-gray-100">
                {list.items.map((n) => (
                  <NotificationItem key={n.id} n={n} compact onNavigate={() => setOpen(false)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
