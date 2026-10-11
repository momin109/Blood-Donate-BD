"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  MapPin,
  Clock,
  Phone,
  Send,
} from "lucide-react";
import PostMenu from "@/components/PostMenu";
import { Avatar, BloodBadge, Button, Card, Status } from "@/components/ui";
import { getDonor, me } from "@/data";
import { cn } from "@/lib/cn";

export default function PostCard({ post }) {
  const d = getDonor(post.donorId);
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const req = post.kind === "request";
  const rows = req && [
    ["Patient", post.patient],
    ["Problem", post.problem],
    ["Hemoglobin", post.hb],
    ["Blood Group", post.group],
    ["Bags", post.bags + " bag(s)"],
    ["Hospital", post.hospital],
    ["Location", post.location],
    ["Needed", post.date],
  ];
  const act =
    "flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-lg text-[13px] hover:bg-gray-50 sm:gap-2 sm:text-sm";

  return (
    <Card
      className={cn("overflow-hidden", post.urgent && "ring-1 ring-brand-200")}
    >
      {post.urgent && (
        <div className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white sm:px-5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          Urgent Blood Needed
        </div>
      )}

      {/* Header: avatar | name + time · location | badge + menu */}
      <div className="flex items-start gap-3 p-4 pb-2 sm:p-5 sm:pb-3">
        <Avatar name={d.name} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <Link
            href={`/donors/${d.id}`}
            className="block truncate text-[15px] font-bold leading-snug hover:underline"
          >
            {d.name}
          </Link>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs leading-tight text-ink-soft">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{post.time}</span>
              <span aria-hidden className="ml-0.5 text-gray-300">
                ·
              </span>
            </span>
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {d.district}, {d.upazila}
              </span>
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!req ? (
            <BloodBadge group={d.group} size="sm" />
          ) : (
            <Status tone={post.urgent ? "danger" : "warning"}>
              {post.urgent ? "Urgent" : "Normal"}
            </Status>
          )}
          <PostMenu postId={post.id} />
        </div>
      </div>

      <div className="px-4 pb-3 sm:px-5">
        {post.approval && (
          <Status tone="success" className="mb-2">
            Auto-Approved
          </Status>
        )}
        <p className="text-[15px] leading-relaxed">{post.text}</p>
        {req && (
          <div
            className={cn(
              "mt-4 overflow-hidden rounded-2xl text-sm ring-1",
              post.urgent
                ? "bg-brand-50/60 ring-brand-100"
                : "bg-gray-50 ring-gray-100",
            )}
          >
            {rows.map(([k, v], i) => (
              <div
                key={k}
                className={cn(
                  "flex gap-3 px-3.5 py-2.5 sm:px-4",
                  i && "border-t border-black/5",
                )}
              >
                <span className="w-24 shrink-0 text-ink-soft">{k}</span>
                <span
                  className={cn(
                    "min-w-0 break-words font-semibold",
                    k === "Blood Group" && "text-brand-700",
                  )}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Like / Comment / Share */}
      <div className="flex items-center justify-between px-4 pb-2 text-xs text-ink-soft sm:px-5">
        <span>{post.likes + (liked ? 1 : 0)} likes</span>
        <span>
          {post.comments} comments · {post.shares + (shared ? 1 : 0)} shares
        </span>
      </div>
      <div className="mx-4 grid grid-cols-3 border-y border-gray-100 font-semibold text-ink-soft sm:mx-5">
        <button
          onClick={() => setLiked(!liked)}
          className={cn(act, liked && "text-brand-600")}
        >
          <ThumbsUp
            className={cn("h-[18px] w-[18px]", liked && "fill-brand-600")}
          />
          Like
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className={cn(act, showComments && "text-brand-600")}
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          Comment
        </button>
        <button
          onClick={() => setShared(!shared)}
          className={cn(act, shared && "text-brand-600")}
        >
          <Share2 className="h-[18px] w-[18px]" />
          {shared ? "Shared" : "Share"}
        </button>
      </div>
      {showComments && (
        <div className="space-y-3 px-4 pt-3 sm:px-5">
          <div className="flex gap-2.5">
            <Avatar name="আরিফ" size="sm" />
            <div className="min-w-0 rounded-2xl bg-surface px-3.5 py-2 text-sm">
              <p className="font-semibold">আরিফ রহমান</p>
              <p>আল্লাহ ভরসা, শীঘ্রই ব্যবস্থা হয়ে যাবে।</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Avatar name={me.name} size="sm" />
            <input
              className="h-10 min-w-0 flex-1 rounded-full bg-surface px-4 text-sm focus:ring-2 focus:ring-brand-200"
              placeholder="Write a comment..."
            />
            <button
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* <div className="flex gap-2 p-3 sm:gap-2.5 sm:p-4">
        <Link href={`/donors/${d.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            View Profile
          </Button>
        </Link>
        <a href={`tel:${d.phone}`} className="flex-1">
          <Button size="sm" className="w-full">
            <Phone className="h-4 w-4 shrink-0" />
            Call Now
          </Button>
        </a>
        <Link href="/chat" aria-label="Chat">
          <Button variant="soft" size="sm">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Chat</span>
          </Button>
        </Link>
      </div> */}
    </Card>
  );
}
