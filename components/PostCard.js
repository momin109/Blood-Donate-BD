"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThumbsUp, MessageCircle, Share2, MapPin, Clock, Phone } from "lucide-react";
import PostMenu from "@/components/PostMenu";
import PostComments from "@/components/PostComments";
import { Avatar, BloodBadge, Button, Card, Status } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/client";
import { formatDateTime, timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";

// API-র Post object দেখায়: লেখা, ছবি, রক্তের অনুরোধের তথ্য, like/comment/share, Save/Report/Edit/Delete
export default function PostCard({ post: initial, onDeleted }) {
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState(initial);
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => setPost(initial), [initial]);

  const patch = (p) => setPost((s) => ({ ...s, ...p }));
  const needLogin = () => {
    router.push("/login");
    return "আগে লগইন করুন";
  };

  const toggleLike = async () => {
    if (!user) return needLogin();
    const on = !post.isLiked;
    patch({ isLiked: on, likes: Math.max(0, post.likes + (on ? 1 : -1)) });
    try {
      const d = await api(`/api/posts/${post.id}/like`, { method: on ? "PUT" : "DELETE" });
      patch({ isLiked: d.isLiked, likes: d.likes });
    } catch {
      patch({ isLiked: !on, likes: post.likes });
    }
  };

  const toggleSave = async () => {
    if (!user) return needLogin();
    const on = !post.isSaved;
    try {
      await api(`/api/posts/${post.id}/save`, { method: on ? "PUT" : "DELETE" });
      patch({ isSaved: on });
      return on ? "পোস্ট সেভ হয়েছে" : "সেভ থেকে সরানো হয়েছে";
    } catch (e) {
      return e.message;
    }
  };

  const link = () => `${window.location.origin}/posts/${post.id}`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link());
      return "লিংক কপি হয়েছে";
    } catch {
      return "লিংক কপি করা যায়নি";
    }
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "Blood Donate BD", text: post.text?.slice(0, 100), url: link() });
      else await copyLink();
    } catch (e) {
      if (e?.name === "AbortError") return; // ব্যবহারকারী বাতিল করেছে
    }
    if (user) api(`/api/posts/${post.id}/share`, { method: "POST" }).then((d) => patch({ shares: d.shares })).catch(() => {});
  };

  const report = async () => {
    if (!user) return needLogin();
    const reason = window.prompt("রিপোর্টের কারণ লিখুন (কমপক্ষে ৩ অক্ষর):");
    if (!reason) return;
    try {
      await api(`/api/posts/${post.id}/report`, { method: "POST", body: { reason } });
      return "রিপোর্ট জমা হয়েছে";
    } catch (e) {
      return e.fieldErrors?.reason || e.message;
    }
  };

  const remove = async () => {
    if (!window.confirm("এই পোস্টটি মুছে ফেলবেন?")) return;
    try {
      await api(`/api/posts/${post.id}`, { method: "DELETE" });
      onDeleted?.(post.id);
    } catch (e) {
      return e.message;
    }
  };

  const saveEdit = async () => {
    setSaving(true);
    setEditError("");
    try {
      const d = await api(`/api/posts/${post.id}`, { method: "PATCH", body: { text: draft } });
      setPost(d.post);
      setEditing(false);
    } catch (e) {
      setEditError(e.fieldErrors?.text || e.message);
    } finally {
      setSaving(false);
    }
  };

  const a = post.author;
  const r = post.request;
  const fulfilled = r?.status === "Fulfilled";
  const urgent = r && !fulfilled && r.urgency !== "Normal";
  const rows = r && [
    ["Patient", `${r.patientName}${r.age != null ? ` (${r.age} বছর)` : ""}`],
    ["Problem", r.reason],
    ["Hemoglobin", r.hemoglobin ? String(r.hemoglobin) : "জানা নেই"],
    ["Blood Group", r.bloodGroup],
    ["Bags", `${r.bags} bag(s)`],
    ["Hospital", r.hospital],
    ["Location", [r.district, r.upazila].filter(Boolean).join(", ")],
    ["Needed", formatDateTime(r.neededAt)],
  ];
  const n = post.images.length;
  const act = "flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-lg text-[13px] hover:bg-gray-50 sm:gap-2 sm:text-sm";

  return (
    <Card className={cn("overflow-hidden", urgent && "ring-1 ring-brand-200")}>
      {urgent && (
        <div className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white sm:px-5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          Urgent Blood Needed
        </div>
      )}

      {/* Header: avatar | name + time · location | badge + menu */}
      <div className="flex items-start gap-3 p-4 pb-2 sm:p-5 sm:pb-3">
        <Avatar name={a?.name || "?"} src={a?.photo} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          {a ? (
            <Link href={`/donors/${a.id}`} className="block truncate text-[15px] font-bold leading-snug hover:underline">{a.name}</Link>
          ) : (
            <span className="block truncate text-[15px] font-bold leading-snug">অজানা ব্যবহারকারী</span>
          )}
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs leading-tight text-ink-soft">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <Link href={`/posts/${post.id}`} className="hover:underline">{timeAgo(post.createdAt)}</Link>
              {a?.district && <span aria-hidden className="ml-0.5 text-gray-300">·</span>}
            </span>
            {a?.district && (
              <span className="inline-flex min-w-0 items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{a.district}, {a.upazila}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {r ? (
            <Status tone={fulfilled ? "success" : urgent ? "danger" : "warning"}>{fulfilled ? "Fulfilled" : r.urgency}</Status>
          ) : (
            a?.bloodGroup && <BloodBadge group={a.bloodGroup} size="sm" />
          )}
          <PostMenu
            post={post}
            onSave={toggleSave}
            onCopy={copyLink}
            onReport={report}
            onEdit={() => {
              setDraft(post.text);
              setEditError("");
              setEditing(true);
            }}
            onDelete={remove}
          />
        </div>
      </div>

      <div className="px-4 pb-3 sm:px-5">
        {editing ? (
          <div className="space-y-2">
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} maxLength={2000} className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-[15px] focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100" />
            {editError && <p className="text-xs text-brand-600">{editError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={saveEdit} disabled={saving}>{saving ? "সেভ হচ্ছে…" : "Save"}</Button>
            </div>
          </div>
        ) : (
          post.text && <p className="whitespace-pre-line break-words text-[15px] leading-relaxed">{post.text}</p>
        )}

        {n > 0 && (
          <div className={cn("mt-3 grid gap-1.5 overflow-hidden rounded-2xl", n === 1 ? "grid-cols-1" : "grid-cols-2")}>
            {post.images.map((src, i) => (
              <a key={src} href={src} target="_blank" rel="noopener noreferrer" className={cn("block overflow-hidden bg-gray-100", n === 1 ? "max-h-[28rem]" : "aspect-square", n === 3 && i === 0 && "col-span-2 aspect-video")}>
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </a>
            ))}
          </div>
        )}

        {rows && (
          <div className={cn("mt-4 overflow-hidden rounded-2xl text-sm ring-1", urgent ? "bg-brand-50/60 ring-brand-100" : "bg-gray-50 ring-gray-100")}>
            {rows.map(([k, v], i) => (
              <div key={k} className={cn("flex gap-3 px-3.5 py-2.5 sm:px-4", i && "border-t border-black/5")}>
                <span className="w-24 shrink-0 text-ink-soft">{k}</span>
                <span className={cn("min-w-0 break-words font-semibold", k === "Blood Group" && "text-brand-700")}>{v}</span>
              </div>
            ))}
          </div>
        )}
        {r && !fulfilled && (
          <a href={r.contactPhone ? `tel:${r.contactPhone}` : "/login"} className="mt-3 block">
            <Button size="sm" className="w-full"><Phone className="h-4 w-4 shrink-0" />{r.contactPhone ? "Call Now" : "Login to Call"}</Button>
          </a>
        )}
      </div>

      {/* Like / Comment / Share */}
      <div className="flex items-center justify-between px-4 pb-2 text-xs text-ink-soft sm:px-5">
        <span>{post.likes} likes</span>
        <span>{post.comments} comments · {post.shares} shares</span>
      </div>
      <div className="mx-4 grid grid-cols-3 border-y border-gray-100 font-semibold text-ink-soft sm:mx-5">
        <button onClick={toggleLike} className={cn(act, post.isLiked && "text-brand-600")}>
          <ThumbsUp className={cn("h-[18px] w-[18px]", post.isLiked && "fill-brand-600")} />
          Like
        </button>
        <button onClick={() => setShowComments(!showComments)} className={cn(act, showComments && "text-brand-600")}>
          <MessageCircle className="h-[18px] w-[18px]" />
          Comment
        </button>
        <button onClick={share} className={act}>
          <Share2 className="h-[18px] w-[18px]" />
          Share
        </button>
      </div>
      {showComments && <PostComments postId={post.id} onCount={(c) => patch({ comments: c })} />}
      <div className="h-3" />
    </Card>
  );
}
