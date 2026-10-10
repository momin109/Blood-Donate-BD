import Link from "next/link";
import { MapPin, MessageCircle, FileText, IdCard, Pencil, Calendar, Hash, HeartPulse } from "lucide-react";
import PostCard from "@/components/PostCard";
import { FavButton } from "@/components/Favorites";
import { Phone } from "lucide-react";
import { Avatar, BloodBadge, Button, Card, Status } from "@/components/ui";
import { getDonor, posts, me } from "@/data";

export default function DonorProfile({ params }) {
  const d = getDonor(params.id);
  const own = d.id === me.id;
  const list = posts.filter((p) => p.donorId === d.id);
  const info = [[BloodBadgeIcon, "রক্তের গ্রুপ", d.group], [Calendar, "শেষ রক্তদান", d.last], [MapPin, "ঠিকানা", `${d.district}, ${d.upazila}`], [Hash, "Donor ID", d.donorId], [HeartPulse, "মোট রক্তদান", `${d.count} বার`]];
  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-4">
      <Card className="overflow-hidden">
        <div className="h-36 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-400 sm:h-52" />
        <div className="px-4 pb-4 sm:px-6">
          <div className="-mt-12 flex flex-col gap-3 sm:-mt-14 sm:flex-row sm:items-end">
            <Avatar name={d.name} size="xl" className="rounded-full ring-4 ring-white" />
            <div className="flex-1">
              <h1 className="break-words text-xl font-bold sm:text-2xl">{d.name}</h1>
              <p className="flex items-center gap-1 text-sm text-ink-soft"><MapPin className="h-3.5 w-3.5" />{d.district}, {d.upazila} · যোগ দিয়েছেন {d.joined}</p>
              <div className="mt-2 flex gap-2"><BloodBadge group={d.group} /><Status tone={d.available ? "success" : "neutral"} className="self-center">{d.available ? "Available" : "Unavailable"}</Status></div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={`tel:${d.phone}`}><Button><Phone className="h-4 w-4" />Call Now</Button></a>
            <Link href="/chat"><Button variant="outline"><MessageCircle className="h-4 w-4" />Message</Button></Link>
            <FavButton id={d.id} className="h-11 w-11" />
            <Button variant="outline"><FileText className="h-4 w-4" />View Posts</Button>
            {own && <Link href="/me"><Button variant="outline"><Pencil className="h-4 w-4" />Edit Profile</Button></Link>}
            <Link href="/id-card"><Button variant="soft"><IdCard className="h-4 w-4" />Download ID Card</Button></Link>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-3 font-bold">তথ্য</p>
        <dl className="grid gap-3 sm:grid-cols-2">
          {info.map(([Icon, k, v]) => (
            <div key={k} className="flex items-center gap-3 rounded-xl bg-surface p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-600"><Icon className="h-4 w-4" /></span>
              <div><dt className="text-xs text-ink-soft">{k}</dt><dd className="text-sm font-semibold">{v}</dd></div>
            </div>
          ))}
        </dl>
      </Card>

      <p className="px-1 font-bold">পোস্ট</p>
      {list.length ? list.map((p) => <PostCard key={p.id} post={p} />) : <Card className="p-6 text-center text-sm text-ink-soft">এখনো কোনো পোস্ট নেই।</Card>}
    </div>
  );
}
function BloodBadgeIcon(props) { return <HeartPulse {...props} />; }
