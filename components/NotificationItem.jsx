"use client";
import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";

// একটি Notification-এর card (bell dropdown, /notifications পেজ ও Admin preview — সব জায়গায় একই)।
// compact = dropdown-এ ছোট (message ২ লাইন, ছবি নিচু); preview = ক্লিক করা যাবে না।
export default function NotificationItem({ n, compact = false, preview = false, onNavigate }) {
  const [imgFailed, setImgFailed] = useState(false);
  const hasLink = !!n.url && !preview;
  const external = /^https?:\/\//i.test(n.url || "");
  const Tag = hasLink ? (external ? "a" : Link) : "div";
  const linkProps = !hasLink ? {} : external ? { href: n.url, target: "_blank", rel: "noopener noreferrer", onClick: onNavigate } : { href: n.url, onClick: onNavigate };

  return (
    <Tag {...linkProps} className={cn("flex w-full min-w-0 items-start gap-3 p-4 text-left", n.unread && "bg-brand-50/60", hasLink && "transition hover:bg-surface")}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <Bell className="h-5 w-5" />
      </span>
      <span className="block min-w-0 flex-1">
        <span className="block break-words text-sm font-semibold leading-snug">{n.title}</span>
        <span className={cn("mt-0.5 break-words text-sm text-ink-soft", compact ? "line-clamp-2" : "block whitespace-pre-line")}>{n.message}</span>
        {n.image && !imgFailed && (
          <span className={cn("mt-2 block overflow-hidden rounded-2xl bg-gray-100", compact ? "max-h-36" : "max-w-md")}>
            <img src={n.image} alt="" loading="lazy" onError={() => setImgFailed(true)} className={cn("w-full object-cover", compact ? "h-36" : "aspect-video")} />
          </span>
        )}
        <span className="mt-1.5 block text-xs text-ink-soft">{timeAgo(n.createdAt)}</span>
      </span>
      {n.unread && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" aria-label="নতুন" />}
    </Tag>
  );
}
