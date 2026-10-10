import Link from "next/link";
import { Image as Img, Droplet, HeartHandshake } from "lucide-react";
import { Avatar, Card } from "@/components/ui";
import { me } from "@/data";

export default function Composer() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar name={me.name} />
        <button className="h-11 flex-1 rounded-full bg-surface px-4 text-left text-[15px] text-ink-soft hover:bg-gray-200">আপনি কী শেয়ার করতে চান?</button>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600"><Img className="h-5 w-5" /></span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-sm font-semibold">
        <button className="flex h-10 items-center justify-center gap-2 rounded-xl hover:bg-brand-50"><HeartHandshake className="h-5 w-5 text-brand-600" />রক্তদান পোস্ট</button>
        <Link href="/requests" className="flex h-10 items-center justify-center gap-2 rounded-xl hover:bg-brand-50"><Droplet className="h-5 w-5 fill-brand-600 text-brand-600" />রক্তের অনুরোধ</Link>
      </div>
    </Card>
  );
}
