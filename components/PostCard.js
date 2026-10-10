import Link from "next/link";
import { MoreHorizontal, MapPin, Clock, Droplet, Phone, MessageCircle } from "lucide-react";
import { Avatar, BloodBadge, Button, Card, Status } from "@/components/ui";
import { getDonor } from "@/data";
import { cn } from "@/lib/cn";

export default function PostCard({ post }) {
  const d = getDonor(post.donorId);
  const req = post.kind === "request";
  const rows = req && [["Patient", post.patient], ["Problem", post.problem], ["Hemoglobin", post.hb], ["Blood Group", post.group], ["Bags", post.bags + " bag(s)"], ["Hospital", post.hospital], ["Location", post.location], ["Needed", post.date]];
  return (
    <Card className={cn("overflow-hidden", post.urgent && "ring-1 ring-brand-200")}>
      {post.urgent && <div className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white"><span className="h-2 w-2 animate-pulse rounded-full bg-white" />Urgent Blood Needed</div>}
      <div className="flex items-center gap-3 p-5 pb-3">
        <Avatar name={d.name} />
        <div className="min-w-0 flex-1">
          <Link href={`/donors/${d.id}`} className="block truncate font-bold hover:underline">{d.name}</Link>
          <p className="flex items-center gap-1.5 text-xs text-ink-soft"><Clock className="h-3 w-3" />{post.time}<span>·</span><MapPin className="h-3 w-3" />{d.district}, {d.upazila}</p>
        </div>
        {!req ? <BloodBadge group={d.group} size="sm" /> : <Status tone={post.urgent ? "danger" : "warning"}>{post.urgent ? "Urgent" : "Normal"}</Status>}
        <button className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-gray-100"><MoreHorizontal className="h-5 w-5" /></button>
      </div>
      <div className="px-5 pb-4">
        <p className="text-[15px] leading-relaxed">{post.text}</p>
        {req && (
          <div className={cn("mt-4 overflow-hidden rounded-2xl text-sm ring-1", post.urgent ? "bg-brand-50/60 ring-brand-100" : "bg-gray-50 ring-gray-100")}>
            {rows.map(([k, v], i) => (
              <div key={k} className={cn("flex gap-3 px-4 py-2.5", i && "border-t border-black/5")}>
                <span className="w-24 shrink-0 text-ink-soft">{k}</span>
                <span className={cn("min-w-0 break-words font-semibold", k === "Blood Group" && "text-brand-700")}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2 border-t border-gray-100 p-3 sm:gap-2.5 sm:p-4">
        <Link href={`/donors/${d.id}`} className="flex-1"><Button variant="outline" size="sm" className="w-full">View Profile</Button></Link>
        <a href={`tel:${d.phone}`} className="flex-1"><Button size="sm" className="w-full"><Phone className="h-4 w-4 shrink-0" />Call Now</Button></a>
        <Link href="/chat" aria-label="Chat"><Button variant="soft" size="sm" aria-label="Message"><MessageCircle className="h-4 w-4" /><span className="hidden sm:inline">Chat</span></Button></Link>
      </div>
    </Card>
  );
}
