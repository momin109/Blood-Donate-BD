import { ThumbsUp, MessageCircle, Mail, CheckCircle2, Droplet, BellOff } from "lucide-react";
import { Card, Empty } from "@/components/ui";
import { notifications } from "@/data";
import { cn } from "@/lib/cn";

const icons = { like: ThumbsUp, comment: MessageCircle, message: Mail, approved: CheckCircle2, post: Droplet };

export default function Notifications() {
  return (
    <div className="mx-auto max-w-xl space-y-3">
      <h1 className="px-1 text-lg font-bold">নোটিফিকেশন</h1>
      <Card className="divide-y divide-gray-100 overflow-hidden">
        {notifications.map((n) => {
          const Icon = icons[n.type];
          return (
            <div key={n.id} className={cn("flex items-start gap-3 p-4", n.unread && "bg-brand-50/60")}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700"><Icon className="h-5 w-5" /></span>
              <div className="flex-1"><p className="text-sm">{n.text}</p><p className="mt-0.5 text-xs text-ink-soft">{n.time}</p></div>
              {n.unread && <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-brand-600" />}
            </div>
          );
        })}
      </Card>
      <p className="px-1 pt-2 text-sm font-semibold text-ink-soft">Empty state preview</p>
      <Card><Empty icon={BellOff} title="কোনো নোটিফিকেশন নেই" hint="নতুন কিছু হলে এখানে দেখতে পাবেন।" /></Card>
    </div>
  );
}
