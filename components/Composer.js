"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Image as Img, Droplet, HeartHandshake } from "lucide-react";
import PostComposer from "@/components/PostComposer";
import { Avatar, Card } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";

export default function Composer({ onPosted }) {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(null); // null | "general" | "donate"
  // login ছাড়া পোস্ট করা যায় না
  const start = (kind) => (user ? setOpen(kind) : router.push("/login?next=/"));

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar name={user?.name || "?"} src={user?.photo} />
        <button onClick={() => start("general")} className="h-11 min-w-0 flex-1 truncate rounded-full bg-surface px-4 text-left text-[15px] text-ink-soft hover:bg-gray-200">
          আপনি কী শেয়ার করতে চান?
        </button>
        <button onClick={() => start("general")} aria-label="ছবি যোগ করুন" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 hover:bg-green-100">
          <Img className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-sm font-semibold">
        <button onClick={() => start("donate")} className="flex h-10 items-center justify-center gap-2 rounded-xl hover:bg-brand-50">
          <HeartHandshake className="h-5 w-5 text-brand-600" />
          Donate Post
        </button>
        <Link href="/requests" className="flex h-10 items-center justify-center gap-2 rounded-xl hover:bg-brand-50">
          <Droplet className="h-5 w-5 fill-brand-600 text-brand-600" />
          Blood Request
        </Link>
      </div>
      {open && <PostComposer initialKind={open} onClose={() => setOpen(null)} onPosted={onPosted} />}
    </Card>
  );
}
