"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BellRing, CheckCheck, Clock3, ImagePlus, Link2, Loader2, Plus, Search, Smartphone, Trash2, Users, X } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import FormDrawer from "@/components/admin/FormDrawer";
import StatCard from "@/components/admin/StatCard";
import Pagination from "@/components/admin/Pagination";
import { useDebounced } from "@/components/admin/useAdminList";
import { dDateTime } from "@/components/admin/fmt";
import NotificationItem from "@/components/NotificationItem";
import { Button, Card, Field, Status } from "@/components/ui";
import { api } from "@/lib/client";
import { cn } from "@/lib/cn";
import { IMAGE_ACCEPT, uploadImage } from "@/lib/image";
import { MAX_RECIPIENTS, MESSAGE_MAX, TITLE_MAX, notificationCreate } from "@/lib/validators/notification";

const PAGE_SIZE = 10;
const LINK_SHORTCUTS = [["Home", "/"], ["Requests", "/requests"], ["Donors", "/donors"], ["Top Donors", "/top-donors"]];

export default function AdminNotifications() {
  const [data, setData] = useState({ items: [], pagination: { total: 0, totalPages: 1 }, stats: null, pushEnabled: true });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleting, setDeleting] = useState("");

  // GET /api/admin/notifications
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const d = await api("/api/admin/notifications", { params: { page, limit: PAGE_SIZE } });
      setData(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page]);
  useEffect(() => {
    load();
  }, [load]);

  // শেষ পেজের সব আইটেম মুছে গেলে আগের পেজে যাওয়া
  useEffect(() => {
    if (!loading && !data.items.length && page > 1) setPage((p) => p - 1);
  }, [loading, data.items.length, page]);

  // POST /api/admin/notifications — আগে Zod দিয়ে ফর্ম যাচাই, পরে সার্ভার
  const send = async (f) => {
    setFieldErrors({});
    if (f.get("uploading") === "1") throw new Error("ছবি আপলোড শেষ হওয়া পর্যন্ত অপেক্ষা করুন।");
    const parsed = notificationCreate.safeParse({
      title: f.get("title"),
      message: f.get("message"),
      url: f.get("url"),
      imageId: f.get("imageId"),
      audience: f.get("audience"),
      recipients: JSON.parse(f.get("recipients") || "[]"),
    });
    if (!parsed.success) {
      const errs = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0]] ??= i.message));
      setFieldErrors(errs);
      throw new Error("চিহ্নিত ঘরগুলো ঠিক করুন।");
    }
    // Push পাঠিয়ে ফেললে ফেরানো যায় না, তাই আগে নিশ্চিত করা
    const who = parsed.data.audience === "all" ? "সব ইউজারকে" : `${parsed.data.recipients.length} জন ইউজারকে`;
    if (!window.confirm(`${who} Notification ও Push পাঠানো হবে। নিশ্চিত?`)) throw new Error("পাঠানো বাতিল করা হয়েছে।");
    let res;
    try {
      res = await api("/api/admin/notifications", { method: "POST", body: parsed.data });
    } catch (e) {
      if (e.fieldErrors) setFieldErrors(e.fieldErrors);
      throw e;
    }
    const { push, pushEnabled } = res;
    setNotice(
      pushEnabled
        ? `Notification পাঠানো হয়েছে। Push: ${push.sent} জনের ডিভাইসে পৌঁছেছে${push.failed ? `, ${push.failed}টি ব্যর্থ` : ""}।`
        : "Notification পাঠানো হয়েছে (Bell-এ দেখা যাবে)। VAPID key সেট না থাকায় Push পাঠানো হয়নি।"
    );
    if (page === 1) load();
    else setPage(1);
  };

  // DELETE /api/admin/notifications/:id
  const remove = async (item) => {
    if (!window.confirm(`“${item.title}” মুছে ফেলবেন? এটি ইউজারদের Notification তালিকা থেকেও সরে যাবে।`)) return;
    setDeleting(item.id);
    setError("");
    try {
      await api(`/api/admin/notifications/${item.id}`, { method: "DELETE" });
      setNotice("Notification মোছা হয়েছে।");
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting("");
    }
  };

  const { items, stats, pagination, pushEnabled } = data;

  return (
    <>
      <PageHeader title="Notification Management" description="ইউজারদের Notification ও Push Notification পাঠান এবং পাঠানোর ইতিহাস দেখুন।">
        <Button
          onClick={() => {
            setNotice("");
            setFieldErrors({});
            setDrawer(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Send Notification
        </Button>
      </PageHeader>

      {notice && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-800" role="status">
          <BellRing className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="min-w-0 flex-1 break-words">{notice}</p>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message" className="rounded-lg p-1 hover:bg-brand-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {error && (
        <div role="alert" className="mb-5 flex flex-col gap-3 rounded-2xl bg-brand-50 p-4 text-sm font-medium text-brand-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="break-words">{error}</p>
          <Button size="sm" variant="outline" onClick={load}>Retry</Button>
        </div>
      )}
      {!pushEnabled && !loading && (
        <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          <b>Push এখনো চালু নয়।</b> <code className="rounded bg-amber-100 px-1">.env.local</code>-এ <code className="rounded bg-amber-100 px-1">VAPID_PUBLIC_KEY</code>, <code className="rounded bg-amber-100 px-1">VAPID_PRIVATE_KEY</code> ও <code className="rounded bg-amber-100 px-1">VAPID_SUBJECT</code> দিয়ে সার্ভার রিস্টার্ট করুন। তার আগে পর্যন্ত Notification শুধু Bell-এ দেখা যাবে।
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard icon={BellRing} label="Total notifications" value={stats ? stats.total : "—"} tone="brand" />
        <StatCard icon={Smartphone} label="Push devices" value={stats ? stats.pushDevices : "—"} tone="blue" />
        <div className="col-span-2 sm:col-span-1">
          <StatCard icon={CheckCheck} label="Push delivered (total)" value={stats ? stats.pushDelivered : "—"} tone="green" />
        </div>
      </div>

      <div className="space-y-3">
        {loading && !items.length ? (
          [0, 1, 2].map((i) => (
            <Card key={i} className="p-4 sm:p-5" aria-busy="true">
              <div className="flex gap-3">
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-2xl bg-gray-100 sm:h-12 sm:w-12" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            </Card>
          ))
        ) : !items.length && !error ? (
          <Card className="p-10 text-center">
            <BellRing className="mx-auto mb-3 h-9 w-9 text-ink-soft" />
            <h3 className="font-bold">এখনো কোনো Notification পাঠানো হয়নি</h3>
            <p className="mt-1 text-sm text-ink-soft">“Send Notification” চেপে প্রথম Notification পাঠান।</p>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="min-w-0 p-4 sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                {item.image ? (
                  <img src={item.image} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-2xl bg-gray-100 object-cover sm:h-16 sm:w-16" />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 sm:h-12 sm:w-12">
                    <BellRing className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="min-w-0 break-words font-bold leading-snug">{item.title}</h3>
                    <Status tone={item.audience === "all" ? "neutral" : "warning"}>{item.audience === "all" ? "All users" : "Selected users"}</Status>
                  </div>
                  <p className="mt-1 line-clamp-3 whitespace-pre-line break-words text-sm leading-6 text-ink-soft">{item.message}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{item.recipientCount.toLocaleString()} recipients</span>
                    <span className="inline-flex items-center gap-1"><Smartphone className="h-3.5 w-3.5" />Push {item.pushSent.toLocaleString()} sent{item.pushFailed ? ` · ${item.pushFailed} failed` : ""}</span>
                    <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{dDateTime(item.createdAt)}</span>
                  </div>
                  {item.url && (
                    <span className="mt-3 inline-flex max-w-full items-center gap-1 rounded-lg border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
                      <Link2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.url}</span>
                    </span>
                  )}
                </div>
                <Button size="sm" variant="soft" aria-label={`Delete ${item.title}`} disabled={deleting === item.id} onClick={() => remove(item)} className="shrink-0">
                  {deleting === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </Card>
          ))
        )}

        {pagination.totalPages > 1 && (
          <Card className="overflow-hidden">
            <Pagination page={page} pages={pagination.totalPages} total={pagination.total} pageSize={PAGE_SIZE} onChange={setPage} />
          </Card>
        )}
      </div>

      <FormDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Send Notification"
        subtitle="Bell-এ দেখানো ও Push পাঠানোর জন্য বার্তা তৈরি করুন।"
        submitLabel="Send"
        onSubmit={send}
      >
        <NotificationForm errors={fieldErrors} />
      </FormDrawer>
    </>
  );
}

// ---------- Drawer-এর ভেতরের ফর্ম (FormData-র জন্য hidden input ব্যবহার করা হয়েছে) ----------
function NotificationForm({ errors }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [audience, setAudience] = useState("all");
  const [image, setImage] = useState(null); // { id, url }
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState("");
  const [selected, setSelected] = useState([]); // [{ id, name, donorId, phone }]
  const fileRef = useRef(null);

  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImgError("");
    if (!file.type.startsWith("image/")) return setImgError("শুধু ছবি (JPG, PNG, WebP, GIF) দিন।");
    if (file.size > 15 * 1024 * 1024) return setImgError("ছবি অনেক বড়। ১৫ MB-এর কম দিন।");
    setUploading(true);
    try {
      const up = await uploadImage(file, "post"); // POST /api/uploads (আগের upload API-ই)
      setImage({ id: up.id, url: up.url });
    } catch (err) {
      setImgError(err.errors?.[0]?.message || err.message);
    } finally {
      setUploading(false);
    }
  }

  const preview = {
    title: title.trim() || "Notification title",
    message: message.trim() || "আপনার বার্তা এখানে এভাবে দেখাবে।",
    image: image?.url,
    url: "",
    unread: false,
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-5">
      <input type="hidden" name="audience" value={audience} />
      <input type="hidden" name="imageId" value={image?.id || ""} />
      <input type="hidden" name="uploading" value={uploading ? "1" : "0"} />
      <input type="hidden" name="recipients" value={JSON.stringify(audience === "selected" ? selected.map((u) => u.id) : [])} />

      <div>
        <Field name="title" label="Title" required maxLength={TITLE_MAX} placeholder="যেমন: জরুরি রক্তের প্রয়োজন" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} />
        <p className="mt-1 text-right text-xs text-ink-soft">{title.length}/{TITLE_MAX}</p>
      </div>

      <div>
        <Field as="textarea" rows={4} name="message" label="Message" required maxLength={MESSAGE_MAX} placeholder="ইউজারদের কাছে যে বার্তাটি পাঠাতে চান..." value={message} onChange={(e) => setMessage(e.target.value)} error={errors.message} />
        <p className="mt-1 text-right text-xs text-ink-soft">{message.length}/{MESSAGE_MAX}</p>
      </div>

      {/* Image upload */}
      <div>
        <span className="label">Image <span className="font-normal text-ink-soft">(ঐচ্ছিক)</span></span>
        <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={pick} />
        {image ? (
          <div className="relative overflow-hidden rounded-2xl bg-gray-100">
            <img src={image.url} alt="Selected" className="aspect-video w-full object-cover" />
            <button type="button" onClick={() => setImage(null)} aria-label="Remove image" className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75">
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={cn("flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-3 text-center text-sm font-medium text-ink-soft transition hover:border-brand-300 hover:bg-brand-50/40 disabled:opacity-60", imgError && "border-brand-500")}
          >
            {uploading ? <Loader2 className="h-6 w-6 animate-spin text-brand-600" /> : <ImagePlus className="h-6 w-6 text-brand-600" />}
            {uploading ? "আপলোড হচ্ছে…" : "ছবি বাছাই করুন (JPG, PNG, WebP)"}
          </button>
        )}
        {(imgError || errors.imageId) && <p className="mt-1 text-xs text-brand-600">{imgError || errors.imageId}</p>}
      </div>

      {/* Target URL */}
      <div>
        <Field name="url" label="Target URL" placeholder="/requests অথবা https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} error={errors.url} icon={Link2} autoCapitalize="none" autoCorrect="off" />
        <div className="mt-2 flex flex-wrap gap-2">
          {LINK_SHORTCUTS.map(([label, href]) => (
            <button key={href} type="button" onClick={() => setUrl(href)} className={cn("h-8 rounded-full px-3 text-xs font-semibold ring-1 transition", url === href ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-ink-soft ring-gray-200 hover:bg-gray-50")}>
              {label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-ink-soft">ফাঁকা রাখলে Bell-এ ক্লিক করলে কোনো page খুলবে না (Push-এ ক্লিক করলে /notifications খুলবে)।</p>
      </div>

      {/* Audience */}
      <div>
        <span className="label">Send to</span>
        <div className="grid grid-cols-2 gap-2">
          {[["all", "All Users", "সব ইউজার"], ["selected", "Selected Users", "নির্দিষ্ট ইউজার"]].map(([v, l, sub]) => (
            <button key={v} type="button" onClick={() => setAudience(v)} aria-pressed={audience === v} className={cn("rounded-2xl border p-3 text-left transition", audience === v ? "border-brand-500 bg-brand-50 ring-4 ring-brand-100" : "border-gray-200 bg-white hover:bg-gray-50")}>
              <span className="block text-sm font-bold">{l}</span>
              <span className="block text-xs text-ink-soft">{sub}</span>
            </button>
          ))}
        </div>
        {audience === "selected" && <UserPicker selected={selected} setSelected={setSelected} error={errors.recipients} />}
      </div>

      {/* Preview */}
      <div>
        <span className="label">Preview</span>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
          <NotificationItem n={preview} preview />
        </div>
      </div>
    </div>
  );
}

// ---------- নির্দিষ্ট ইউজার বাছাই (GET /api/admin/donors?q=) ----------
function UserPicker({ selected, setSelected, error }) {
  const [q, setQ] = useState("");
  const dq = useDebounced(q.trim(), 350);
  const [res, setRes] = useState({ items: [], loading: false, error: "" });

  useEffect(() => {
    if (dq.length < 2) return setRes({ items: [], loading: false, error: "" });
    let off = false;
    setRes((s) => ({ ...s, loading: true, error: "" }));
    api("/api/admin/donors", { params: { q: dq, limit: 8 } })
      .then((d) => !off && setRes({ items: d.items.filter((u) => u.status !== "Blocked"), loading: false, error: "" }))
      .catch((e) => !off && setRes({ items: [], loading: false, error: e.message }));
    return () => {
      off = true;
    };
  }, [dq]);

  const ids = new Set(selected.map((u) => u.id));
  const full = selected.length >= MAX_RECIPIENTS;
  const add = (u) => !ids.has(u.id) && !full && setSelected((s) => [...s, { id: u.id, name: u.name, donorId: u.donorId, phone: u.phone }]);

  return (
    <div className={cn("mt-3 space-y-3 rounded-2xl border bg-gray-50 p-3", error ? "border-brand-500" : "border-gray-100")}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()} placeholder="নাম, ফোন বা Donor ID দিয়ে খুঁজুন" className="h-11 w-full min-w-0 rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
      </div>

      {dq.length >= 2 && (
        <div className="max-h-52 overflow-y-auto rounded-xl bg-white ring-1 ring-gray-100">
          {res.loading ? (
            <p className="flex items-center gap-2 p-3 text-sm text-ink-soft"><Loader2 className="h-4 w-4 animate-spin" />খোঁজা হচ্ছে…</p>
          ) : res.error ? (
            <p className="p-3 text-sm text-brand-700">{res.error}</p>
          ) : !res.items.length ? (
            <p className="p-3 text-sm text-ink-soft">কাউকে পাওয়া যায়নি।</p>
          ) : (
            res.items.map((u) => (
              <button key={u.id} type="button" onClick={() => add(u)} disabled={ids.has(u.id) || full} className="flex w-full items-center gap-3 border-b border-gray-50 px-3 py-2.5 text-left last:border-0 hover:bg-surface disabled:opacity-50">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{u.name}</span>
                  <span className="block truncate text-xs text-ink-soft">{u.donorId} · {u.phone}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-brand-600">{ids.has(u.id) ? "Added" : "Add"}</span>
              </button>
            ))
          )}
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold text-ink-soft">নির্বাচিত: {selected.length}/{MAX_RECIPIENTS}</p>
        {selected.length ? (
          <div className="flex flex-wrap gap-2">
            {selected.map((u) => (
              <span key={u.id} className="inline-flex max-w-full items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1 text-xs font-semibold text-brand-800">
                <span className="truncate">{u.name}</span>
                <button type="button" onClick={() => setSelected((s) => s.filter((x) => x.id !== u.id))} aria-label={`Remove ${u.name}`} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-brand-100">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-ink-soft">উপরে সার্চ করে ইউজার যোগ করুন।</p>
        )}
        {error && <p className="mt-2 text-xs text-brand-600">{error}</p>}
      </div>
    </div>
  );
}
