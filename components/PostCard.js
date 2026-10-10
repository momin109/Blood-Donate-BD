"use client";
import { useState } from "react";
import Link from "next/link";
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Globe2, Droplet } from "lucide-react";
import { Avatar, BloodBadge, Button, Card } from "@/components/ui";
import { getDonor } from "@/data";
import { cn } from "@/lib/cn";

export default function PostCard({ post }) {
  const d = getDonor(post.donorId);
  const [liked, setLiked] = useState(false);
  const req = post.kind === "request";
  const rows = req && [["রোগী", post.patient], ["সমস্যা", post.problem], ["হিমোগ্লোবিন", post.hb], ["ব্লাড গ্রুপ", post.group], ["ব্যাগ", post.bags + " ব্যাগ"], ["হাসপাতাল", post.hospital], ["স্থান", post.location], ["সময়", post.date]];
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 p-4 pb-2">
        <Avatar name={d.name} ring="ring-blue-500" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><Link href={`/donors/${d.id}`} className="truncate font-bold hover:underline">{d.name}</Link><button className="text-sm font-semibold text-blue-600">Follow</button></div>
          <p className="flex items-center gap-1 text-xs text-ink-soft">{post.time} · <Globe2 className="h-3 w-3" /> {d.district}, {d.upazila}</p>
        </div>
        {!req && <BloodBadge group={d.group} size="sm" />}
        <button className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-gray-100"><MoreHorizontal className="h-5 w-5" /></button>
      </div>

      <div className="px-4 pb-3">
        {post.urgent && <p className="mb-2 flex items-center gap-1.5 text-xl font-extrabold"><Droplet className="h-5 w-5 fill-brand-600 text-brand-600" />জরুরী রক্তের প্রয়োজন<Droplet className="h-5 w-5 fill-brand-600 text-brand-600" /></p>}
        <p className="text-[15px] leading-relaxed">{post.text}</p>
        {req && (
          <div className={cn("mt-3 overflow-hidden rounded-2xl border-l-4 text-sm", post.urgent ? "border-brand-600 bg-brand-50" : "border-amber-400 bg-amber-50")}>
            {rows.map(([k, v], i) => (
              <div key={k} className={cn("flex gap-3 px-3.5 py-2", i && "border-t border-black/5")}>
                <span className="w-24 shrink-0 text-ink-soft">{k}</span>
                <span className={cn("font-semibold", k === "ব্লাড গ্রুপ" && "text-brand-700")}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 pb-2 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5"><span className="flex -space-x-1"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 ring-2 ring-white"><ThumbsUp className="h-2.5 w-2.5 fill-white text-white" /></span><span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 ring-2 ring-white"><Droplet className="h-2.5 w-2.5 fill-white text-white" /></span></span>{post.likes + (liked ? 1 : 0)}</span>
        <span>{post.comments} কমেন্ট · {post.shares} শেয়ার</span>
      </div>
      <div className="mx-4 grid grid-cols-3 border-y border-gray-100 text-sm font-semibold text-ink-soft">
        <button onClick={() => setLiked(!liked)} className={cn("flex h-11 items-center justify-center gap-2 rounded-lg hover:bg-gray-50", liked && "text-blue-600")}><ThumbsUp className={cn("h-[18px] w-[18px]", liked && "fill-blue-600")} />লাইক</button>
        <button className="flex h-11 items-center justify-center gap-2 rounded-lg hover:bg-gray-50"><MessageCircle className="h-[18px] w-[18px]" />কমেন্ট</button>
        <button className="flex h-11 items-center justify-center gap-2 rounded-lg hover:bg-gray-50"><Share2 className="h-[18px] w-[18px]" />শেয়ার</button>
      </div>
      <div className="flex gap-2 p-4">
        <Link href={`/donors/${d.id}`} className="flex-1"><Button variant="outline" size="sm" className="w-full">প্রোফাইল দেখুন</Button></Link>
        <Link href="/chat" className="flex-1"><Button size="sm" className="w-full">{req ? "যোগাযোগ করুন" : "মেসেজ করুন"}</Button></Link>
      </div>
    </Card>
  );
}
