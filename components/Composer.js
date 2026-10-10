import Link from "next/link";
import { Image as Img, Droplet, HeartHandshake, ShieldCheck, ChevronRight } from "lucide-react";
import { Avatar, Card } from "@/components/ui";
import { me } from "@/data";

export default function Composer() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar name={me.name} />
        <button className="h-11 min-w-0 flex-1 truncate rounded-full bg-surface px-4 text-left text-[15px] text-ink-soft hover:bg-gray-200">আপনি কী শেয়ার করতে চান?</button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600"><Img className="h-5 w-5" /></span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-sm font-semibold">
        <button className="flex h-10 items-center justify-center gap-2 rounded-xl hover:bg-brand-50"><HeartHandshake className="h-5 w-5 text-brand-600" />Donate Post</button>
        <Link href="/requests" className="flex h-10 items-center justify-center gap-2 rounded-xl hover:bg-brand-50"><Droplet className="h-5 w-5 fill-brand-600 text-brand-600" />Blood Request</Link>
      </div>
      {/* Auto-Approve UI (display only; no backend change) */}
      <div className="mt-3 rounded-2xl bg-green-50 p-3 text-green-800">
        <p className="flex items-center gap-2 text-xs font-bold"><ShieldCheck className="h-4 w-4 shrink-0" />Auto-Approve is ON</p>
        <p className="mt-0.5 text-xs">Posts are checked automatically and go live instantly.</p>
        <ol className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
          <li className="rounded-full bg-white px-2.5 py-1">Submitted</li><ChevronRight className="h-3 w-3" />
          <li className="rounded-full bg-white px-2.5 py-1">Auto-check</li><ChevronRight className="h-3 w-3" />
          <li className="rounded-full bg-green-600 px-2.5 py-1 text-white">Published</li>
        </ol>
      </div>
    </Card>
  );
}
