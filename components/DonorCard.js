import Link from "next/link";
import { MapPin, CalendarCheck } from "lucide-react";
import { Avatar, BloodBadge, Button, Card, Status } from "@/components/ui";

export default function DonorCard({ donor: d }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar name={d.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{d.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-soft"><MapPin className="h-3.5 w-3.5" />{d.district}, {d.upazila}</p>
        </div>
        <BloodBadge group={d.group} />
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-surface px-3 py-2 text-sm">
        <span className="flex items-center gap-1.5 text-ink-soft"><CalendarCheck className="h-4 w-4" />শেষ রক্তদান: {d.last}</span>
        <Status tone={d.available ? "success" : "neutral"}>{d.available ? "Available" : "Unavailable"}</Status>
      </div>
      <div className="mt-3 flex gap-2">
        <Link href={`/donors/${d.id}`} className="flex-1"><Button variant="outline" size="sm" className="w-full">প্রোফাইল</Button></Link>
        <Link href="/chat" className="flex-1"><Button size="sm" className="w-full">মেসেজ</Button></Link>
      </div>
    </Card>
  );
}
