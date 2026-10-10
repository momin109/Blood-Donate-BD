"use client";
import Link from "next/link";
import { MapPin, CalendarCheck, Phone, MessageCircle } from "lucide-react";
import { Avatar, BloodBadge, Button, Card, Status } from "@/components/ui";
import { FavButton } from "@/components/Favorites";

export default function DonorCard({ donor: d }) {
  return (
    <Card className="min-w-0 p-4 transition hover:-translate-y-0.5 sm:p-5">
      {/* Left: avatar + name/location · Right: blood group (top-right) */}
      <div className="flex items-start gap-3">
        <Avatar name={d.name} size="lg" online={d.available} />
        <div className="min-w-0 flex-1">
          <Link href={`/donors/${d.id}`} className="block truncate font-bold leading-snug hover:underline">{d.name}</Link>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-soft"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{d.district}, {d.upazila}</span></p>
        </div>
        <BloodBadge group={d.group} className="shrink-0 ring-4 ring-brand-100" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <Status tone={d.available ? "success" : "neutral"}><span className={"h-1.5 w-1.5 rounded-full " + (d.available ? "bg-green-500" : "bg-gray-400")} />{d.available ? "Available" : "Unavailable"}</Status>
        <FavButton id={d.id} />
      </div>
      <p className="mt-3 flex items-center gap-2 rounded-2xl bg-surface px-3.5 py-2.5 text-sm text-ink-soft"><CalendarCheck className="h-4 w-4 shrink-0" /><span className="min-w-0">Last donation: <b className="text-ink">{d.last}</b></span></p>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <a href={`tel:${d.phone}`}><Button className="w-full" size="sm"><Phone className="h-4 w-4" />Call Now</Button></a>
        <Link href="/chat"><Button variant="outline" className="w-full" size="sm"><MessageCircle className="h-4 w-4" />Chat</Button></Link>
      </div>
      <Link href={`/donors/${d.id}`} className="mt-3 block text-center text-sm font-semibold text-brand-600 hover:underline">View Profile</Link>
    </Card>
  );
}
