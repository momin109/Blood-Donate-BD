"use client";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import { ArrowLeft, Flag, LogIn, MessageCircle, Search, Send, X } from "lucide-react";
import { Avatar, Button, Card, Empty, Field } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/client";
import { chatTime } from "@/lib/format";
import { cn } from "@/lib/cn";

const POLL_MS = 7000; // Socket.IO সংযোগ না থাকলে fallback হিসেবে প্রতি ৭ সেকেন্ডে polling
const MAX_LEN = 1000;

// মেসেজ id অনুযায়ী merge: একই মেসেজ (REST + socket দুই পথে এলেও) একবারই থাকে, আর history API-র (_id) ক্রমেই সাজানো থাকে
const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
function mergeMessages(old, incoming) {
  const seen = new Set(old.map((m) => m.id));
  const fresh = incoming.filter((m) => !seen.has(m.id));
  return fresh.length ? [...old, ...fresh].sort(byId) : old;
}
const joinRoom = (socket, id) => new Promise((resolve) => socket.emit("conversation:join", id, resolve));

export default function ChatPage() {
  // useSearchParams (?to=<userId>) Suspense-এর ভেতরে রাখতে হয়
  return (
    <Suspense fallback={<p className="py-20 text-center text-sm text-ink-soft">লোড হচ্ছে…</p>}>
      <Chat />
    </Suspense>
  );
}

function Chat() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const startWith = params.get("to");

  const [convs, setConvs] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(null); // mobile-এ list/chat toggle-ও এটিই
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const scroller = useRef(null);
  const stick = useRef(true); // নতুন মেসেজে নিচে scroll হবে কিনা
  const msgRef = useRef(messages);
  msgRef.current = messages;
  const activeRef = useRef(activeId);
  activeRef.current = activeId;
  const socketRef = useRef(null);
  const [live, setLive] = useState(null); // null = সংযোগ হচ্ছে, true = real-time চালু, false = বিচ্ছিন্ন (polling চলছে)

  const active = convs.find((c) => c.id === activeId) || null;
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? convs.filter((c) => c.other.name.toLowerCase().includes(q)) : convs;
  }, [convs, search]);

  const loadConvs = useCallback(async () => {
    try {
      const d = await api("/api/chat/conversations");
      // এইমাত্র শুরু করা (এখনও মেসেজ নেই) conversation তালিকা থেকে হারাবে না
      setConvs((old) => {
        const extra = old.filter((o) => !d.items.some((n) => n.id === o.id) && !o.lastMessage);
        // যে conversation এখন খোলা, তার unread সবসময় ০
        return [...extra, ...d.items].map((c) => (c.id === activeRef.current ? { ...c, unread: 0 } : c));
      });
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setListLoading(false);
    }
  }, []);

  // প্রথমবার: conversation তালিকা
  useEffect(() => {
    if (user) loadConvs();
  }, [user, loadConvs]);

  // /chat?to=<userId> → ওই user-এর সাথে conversation খুলে দেওয়া
  useEffect(() => {
    if (!user || !startWith) return;
    let off = false;
    api("/api/chat/conversations", { method: "POST", body: { userId: startWith } })
      .then((d) => {
        if (off) return;
        setConvs((old) => [d.conversation, ...old.filter((c) => c.id !== d.conversation.id)]);
        setActiveId(d.conversation.id);
      })
      .catch((e) => !off && setError(e.message))
      .finally(() => !off && router.replace("/chat"));
    return () => {
      off = true;
    };
  }, [user, startWith, router]);

  // conversation বাছলে: সর্বশেষ মেসেজ আনা (server এটিকে "পড়া হয়েছে" ধরে)
  useEffect(() => {
    if (!activeId) return;
    let off = false;
    setMessages([]);
    setHasMore(false);
    setSendError("");
    setMsgLoading(true);
    stick.current = true;
    api(`/api/chat/conversations/${activeId}/messages`)
      .then((d) => {
        if (off) return;
        setMessages((old) => mergeMessages(old, d.items)); // এর মধ্যে socket-এ আসা মেসেজ হারাবে না
        setHasMore(d.hasMore);
        setConvs((old) => old.map((c) => (c.id === activeId ? { ...c, unread: 0 } : c)));
      })
      .catch((e) => !off && setError(e.message))
      .finally(() => !off && setMsgLoading(false));
    return () => {
      off = true;
    };
  }, [activeId]);

  // খোলা conversation-এর শেষ দেখা মেসেজের পরের নতুন মেসেজ আনা (polling, reconnect ও room join-এর পর ফাঁক পূরণ)
  const fetchNew = useCallback(async () => {
    const id = activeRef.current;
    if (!id) return;
    const last = msgRef.current[msgRef.current.length - 1];
    try {
      const d = await api(`/api/chat/conversations/${id}/messages`, { params: last ? { after: last.id } : {} });
      if (activeRef.current === id && d.items.length) setMessages((old) => mergeMessages(old, d.items));
    } catch {}
  }, []);

  // Socket.IO: login থাকলে সংযোগ খোলা। auth cookie নিজে থেকেই যায়; server যাচাই করে।
  // Disconnect হলে socket.io নিজে বারবার reconnect চেষ্টা করে (exponential backoff)।
  useEffect(() => {
    if (!user) return;
    const myId = user.id;
    const s = io({ path: "/socket.io", reconnectionDelay: 1000, reconnectionDelayMax: 10000 });
    socketRef.current = s;

    s.on("connect", () => {
      setLive(true); // নতুন (বা পুনরায়) সংযোগ → room-এ ঢোকা নিচের effect-এ হয়
      loadConvs();
    });
    s.on("disconnect", () => setLive(false));
    s.on("connect_error", () => setLive(false)); // login নেই/server বন্ধ → polling fallback

    // অন্য কেউ (বা নিজের অন্য tab) মেসেজ পাঠালে, খোলা conversation-এ সঙ্গে সঙ্গে
    s.on("message:new", (m) => {
      if (m.conversationId !== activeRef.current) return;
      const el = scroller.current;
      stick.current = !el || el.scrollHeight - el.scrollTop - el.clientHeight < 120; // পুরনো মেসেজ পড়ার সময় জোর করে নামাবে না
      setMessages((old) => mergeMessages(old, [{ id: m.id, text: m.text, mine: m.senderId === myId, createdAt: m.createdAt }]));
      // খোলা chat-এ এসেছে, তাই পড়া হয়েছে চিহ্নিত (server এই GET-কে "read" ধরে)
      if (m.senderId !== myId) api(`/api/chat/conversations/${m.conversationId}/messages`, { params: { after: m.id } }).catch(() => {});
    });
    // নতুন মেসেজ/lock/delete হলে conversation list (preview, unread, locked) নতুন করে আনা
    s.on("conversation:updated", () => loadConvs());

    return () => {
      s.disconnect();
      socketRef.current = null;
      setLive(null);
    };
  }, [user, loadConvs]);

  // খোলা conversation-এর room-এ ঢোকা (server participant কিনা যাচাই করে)। reconnect হলে room হারায়, তাই live বদলালেও আবার ঢোকে।
  // ঢোকার পরই fetchNew: history আনা ও room join-এর মাঝে আসা মেসেজ যেন বাদ না পড়ে।
  useEffect(() => {
    const s = socketRef.current;
    if (live !== true || !s) return;
    if (!activeId) {
      s.emit("conversation:leave");
      return;
    }
    let off = false;
    joinRoom(s, activeId).then((r) => {
      if (off) return;
      if (r?.ok) fetchNew();
      else setError("Real-time সংযোগ চালু করা যায়নি; কিছুক্ষণ পর আবার চেষ্টা করুন।");
    });
    return () => {
      off = true;
    };
  }, [activeId, live, fetchNew]);

  // Fallback polling: শুধু Socket.IO সংযোগ না থাকলে (custom server ছাড়া চালালে বা নেটওয়ার্ক সমস্যায়)
  useEffect(() => {
    if (!user || live === true) return;
    const t = setInterval(() => {
      if (document.hidden) return;
      loadConvs();
      fetchNew();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [user, live, loadConvs, fetchNew]);

  // নতুন মেসেজ এলে (বা পাঠালে) নিচে scroll
  const lastId = messages[messages.length - 1]?.id;
  useEffect(() => {
    if (stick.current && scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [lastId, activeId]);

  const loadOlder = async () => {
    const first = messages[0];
    if (!first) return;
    stick.current = false;
    try {
      const d = await api(`/api/chat/conversations/${activeId}/messages`, { params: { before: first.id } });
      setMessages((old) => mergeMessages(old, d.items));
      setHasMore(d.hasMore);
    } catch (e) {
      setSendError(e.message);
    }
  };

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending || !active) return;
    setSending(true);
    setSendError("");
    try {
      const d = await api(`/api/chat/conversations/${activeId}/messages`, { method: "POST", body: { text: body } });
      stick.current = true;
      setMessages((old) => mergeMessages(old, [d.message])); // socket echo আগে এলেও duplicate হবে না
      setText("");
      setConvs((old) => {
        const cur = old.find((c) => c.id === activeId);
        const next = { ...cur, lastMessage: { text: d.message.text, mine: true, at: d.message.createdAt }, updatedAt: d.message.createdAt };
        return [next, ...old.filter((c) => c.id !== activeId)];
      });
    } catch (err) {
      setSendError(err.fieldErrors?.text || err.message);
    } finally {
      setSending(false);
    }
  };

  if (authLoading) return <p className="py-20 text-center text-sm text-ink-soft">লোড হচ্ছে…</p>;
  if (!user) {
    return (
      <Card className="mx-auto max-w-md p-6">
        <Empty icon={MessageCircle} title="মেসেজ দেখতে লগইন করুন" hint="শুধু লগইন করা ব্যবহারকারীরা চ্যাট করতে পারেন।" />
        <Link href="/login" className="mt-2 block">
          <Button className="w-full"><LogIn className="h-4 w-4" />Login</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="mx-auto grid h-[calc(100dvh-11rem)] max-w-5xl overflow-hidden lg:h-[calc(100dvh-7.5rem)] md:grid-cols-[320px_1fr]">
      <section className={cn("min-h-0 flex-col border-r border-gray-100", activeId ? "hidden md:flex" : "flex")}>
        <div className="p-4"><p className="mb-3 text-lg font-bold">মেসেজ</p>
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 w-full rounded-full bg-surface pl-9 text-sm" placeholder="খুঁজুন" /></div>
        </div>
        {live === false && <p className="mx-4 mb-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">Real-time সংযোগ নেই, আবার চেষ্টা করা হচ্ছে…</p>}
        {error && <p role="alert" className="mx-4 mb-2 rounded-xl bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">{error}</p>}
        <ul className="flex-1 overflow-y-auto">
          {listLoading && <li className="px-4 py-6 text-center text-sm text-ink-soft">লোড হচ্ছে…</li>}
          {!listLoading && shown.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-ink-soft">
              {convs.length ? "কাউকে খুঁজে পাওয়া যায়নি" : <>কোনো মেসেজ নেই। <Link href="/donors" className="font-semibold text-brand-600">ডোনার</Link> খুঁজে চ্যাট শুরু করুন।</>}
            </li>
          )}
          {shown.map((x) => (
            <li key={x.id}>
              <button onClick={() => setActiveId(x.id)} className={cn("flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50", activeId === x.id && "md:bg-brand-50")}>
                <Avatar name={x.other.name} src={x.other.photo} />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2"><p className="truncate font-semibold">{x.other.name}</p><span className="shrink-0 text-xs text-ink-soft">{x.lastMessage ? chatTime(x.updatedAt) : ""}</span></div>
                  <p className={cn("truncate text-sm", x.unread ? "font-semibold text-ink" : "text-ink-soft")}>{x.lastMessage ? `${x.lastMessage.mine ? "আপনি: " : ""}${x.lastMessage.text}` : "নতুন কথোপকথন"}</p>
                </div>
                {x.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">{x.unread}</span>}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={cn("min-h-0 flex-col", activeId ? "flex" : "hidden md:flex")}>
        {!active ? (
          <div className="flex flex-1 items-center justify-center"><Empty icon={MessageCircle} title="একটি কথোপকথন বেছে নিন" hint="বাম পাশ থেকে কাউকে সিলেক্ট করুন।" /></div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-gray-100 p-3">
              <button onClick={() => setActiveId(null)} aria-label="ফিরে যান" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 md:hidden"><ArrowLeft className="h-5 w-5" /></button>
              <Link href={`/donors/${active.other.id}`}><Avatar name={active.other.name} src={active.other.photo} size="sm" /></Link>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight">{active.other.name}</p>
                <p className="truncate text-xs text-ink-soft">{[active.other.bloodGroup, active.other.district].filter(Boolean).join(" · ")}</p>
              </div>
              <button onClick={() => setReportOpen(true)} aria-label="রিপোর্ট করুন" title="রিপোর্ট করুন" className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-gray-100"><Flag className="h-4 w-4" /></button>
            </div>

            <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto bg-surface p-4">
              {hasMore && <button onClick={loadOlder} className="mx-auto block rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm hover:bg-brand-50">আগের মেসেজ দেখুন</button>}
              {msgLoading && <p className="py-6 text-center text-sm text-ink-soft">লোড হচ্ছে…</p>}
              {!msgLoading && messages.length === 0 && <p className="py-10 text-center text-sm text-ink-soft">এখনও কোনো মেসেজ নেই। প্রথম মেসেজটি পাঠান।</p>}
              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.mine && "justify-end")}>
                  <div className={cn("max-w-[78%] rounded-2xl px-3.5 py-2 text-sm", m.mine ? "rounded-br-md bg-brand-600 text-white" : "rounded-bl-md bg-white shadow-sm")}>
                    <p className="whitespace-pre-wrap break-words">{m.text}</p><p className={cn("mt-0.5 text-[10px]", m.mine ? "text-brand-100" : "text-gray-400")}>{chatTime(m.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>

            {sendError && <p role="alert" className="border-t border-gray-100 bg-brand-50 px-4 py-2 text-xs font-medium text-brand-700">{sendError}</p>}
            {active.locked ? (
              <p className="border-t border-gray-100 p-4 text-center text-sm text-ink-soft">এই কথোপকথন অ্যাডমিন বন্ধ করেছেন। নতুন মেসেজ পাঠানো যাবে না।</p>
            ) : (
              <form onSubmit={send} className="flex items-center gap-2 border-t border-gray-100 p-3">
                <input value={text} onChange={(e) => setText(e.target.value)} maxLength={MAX_LEN} className="h-10 flex-1 rounded-full bg-surface px-4 text-sm focus:ring-2 focus:ring-brand-200" placeholder="মেসেজ লিখুন..." />
                <button type="submit" disabled={!text.trim() || sending} aria-label="পাঠান" className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white disabled:opacity-50"><Send className="h-4 w-4" /></button>
              </form>
            )}
          </>
        )}
      </section>

      {reportOpen && active && <ReportDialog conv={active} onClose={() => setReportOpen(false)} />}
    </Card>
  );
}

// কথোপকথন রিপোর্ট: POST /api/chat/conversations/:id/report { reason }
function ReportDialog({ conv, onClose }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(`/api/chat/conversations/${conv.id}/report`, { method: "POST", body: { reason } });
      setDone(true);
    } catch (err) {
      setError(err.fieldErrors?.reason || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1"><p className="text-lg font-bold">রিপোর্ট করুন</p><p className="truncate text-sm text-ink-soft">{conv.other.name}</p></div>
          <button type="button" onClick={onClose} aria-label="বন্ধ করুন" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        {done ? (
          <>
            <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">রিপোর্ট জমা হয়েছে। অ্যাডমিন বিষয়টি দেখবেন।</p>
            <Button type="button" className="w-full" onClick={onClose}>ঠিক আছে</Button>
          </>
        ) : (
          <>
            <Field as="textarea" rows={3} maxLength={300} label="কারণ" required placeholder="কী সমস্যা হয়েছে লিখুন" value={reason} onChange={(e) => setReason(e.target.value)} error={!!error} />
            {error && <p role="alert" className="text-xs font-medium text-brand-700">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy || reason.trim().length < 3}>{busy ? "জমা হচ্ছে…" : "রিপোর্ট জমা দিন"}</Button>
          </>
        )}
      </form>
    </div>
  );
}
