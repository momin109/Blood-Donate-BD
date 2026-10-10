"use client";
import { useState } from "react";
import Link from "next/link";
import { Camera, MapPin, Phone, MessageCircle, Pencil, IdCard, Calendar, Hash, HeartPulse, Droplet, BadgeCheck, Building2 } from "lucide-react";
import PostCard from "@/components/PostCard";
import { FavButton, useFavs } from "@/components/Favorites";
import { Avatar, BloodBadge, Button, Card, Status } from "@/components/ui";
import { getDonor, posts } from "@/data";
import { cn } from "@/lib/cn";

const tabs = ["Posts", "About", "Donations"];
const history = [["Dhaka Medical College Hospital", ""], ["Square Hospital", "12 Feb 2026"], ["Rajshahi Medical College", "5 Oct 2025"]];

// Facebook-style profile: cover + overlapping avatar + name/info + tabs. Works for any donor (own = my profile).
export default function ProfileView({ donorId, own = false }) {
  const d = getDonor(donorId);
  const { favs } = useFavs();
  const [tab, setTab] = useState("Posts");
  const list = posts.filter((p) => p.donorId === d.id).map((p) => (own ? { ...p, approval: "approved" } : p));
  const stats = [["Donations", `${d.count}x`], ["Blood Group", d.group], ["Last Donation", d.last], ...(own ? [["Favorites", favs.length]] : [])];
  const about = [[Droplet, "Blood Group", d.group], [Calendar, "Last Donation", d.last], [MapPin, "Location", `${d.district}, ${d.upazila}`], [Hash, "Donor ID", d.donorId], [HeartPulse, "Total Donations", `${d.count} times`], [Phone, "Mobile", d.phone]];

  return (
    <div className="min-w-0 space-y-5">
      <Card className="overflow-hidden">
        {/* Cover */}
        <div className="relative h-36 overflow-hidden bg-gradient-to-br from-brand-800 via-brand-600 to-brand-400 sm:h-56 lg:h-72">
          <span className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
          <span className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-black/10" />
          <Droplet className="absolute right-6 top-1/2 h-28 w-28 -translate-y-1/2 text-white/10 sm:h-48 sm:w-48" strokeWidth={1.2} />
          {own && <button className="absolute bottom-3 right-3 flex h-9 items-center gap-2 rounded-xl bg-white/90 px-3 text-sm font-semibold shadow hover:bg-white"><Camera className="h-4 w-4" /><span className="hidden sm:inline">Edit Cover</span></button>}
        </div>

        {/* Avatar overlapping cover + name/actions */}
        <div className="px-4 pb-4 sm:px-8">
          <div className="-mt-16 flex flex-col items-center gap-3 sm:-mt-20 sm:flex-row sm:items-end sm:gap-6">
            <div className="relative shrink-0">
              <Avatar name={d.name} size="2xl" className="rounded-full ring-4 ring-white" />
              {own && <button aria-label="Change photo" className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-ink ring-4 ring-white hover:bg-gray-200"><Camera className="h-4 w-4" /></button>}
            </div>
            <div className="min-w-0 flex-1 text-center sm:pb-2 sm:text-left">
              <h1 className="flex items-center justify-center gap-1.5 text-2xl font-extrabold leading-tight sm:justify-start sm:text-3xl"><span className="break-words">{d.name}</span><BadgeCheck className="h-5 w-5 shrink-0 text-blue-500" /></h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-sm text-ink-soft sm:justify-start">
                <BloodBadge group={d.group} size="sm" />
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 shrink-0" />{d.district}, {d.upazila}</span>
                <Status tone={d.available ? "success" : "neutral"}>{d.available ? "Available" : "Unavailable"}</Status>
              </div>
              <p className="mt-1 text-xs text-ink-soft">Joined {d.joined}</p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2.5 sm:w-auto sm:grid-cols-none sm:grid-flow-col sm:pb-2">
              {own ? (
                <>
                  <Button><Pencil className="h-4 w-4" />Edit Profile</Button>
                  <Link href="/id-card"><Button variant="soft" className="w-full"><IdCard className="h-4 w-4" />ID Card</Button></Link>
                </>
              ) : (
                <>
                  <a href={`tel:${d.phone}`}><Button className="w-full"><Phone className="h-4 w-4" />Call Now</Button></a>
                  <Link href="/chat"><Button variant="outline" className="w-full"><MessageCircle className="h-4 w-4" />Message</Button></Link>
                </>
              )}
            </div>
          </div>
          {!own && <div className="mt-3 flex justify-center sm:justify-start"><FavButton id={d.id} /></div>}

          {/* Stats */}
          <div className="mt-5 grid grid-cols-2 divide-gray-100 rounded-2xl bg-surface sm:grid-cols-4 sm:divide-x">
            {stats.map(([k, v]) => (
              <div key={k} className="min-w-0 px-4 py-3 text-center"><p className="truncate text-base font-extrabold sm:text-lg">{v}</p><p className="text-xs text-ink-soft">{k}</p></div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-100 px-2 sm:px-6">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("relative h-12 flex-1 text-sm font-semibold transition sm:flex-none sm:px-6", tab === t ? "text-brand-600" : "text-ink-soft hover:text-ink")}>
              {t}{tab === t && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-brand-600" />}
            </button>
          ))}
        </div>
      </Card>

      {tab === "Posts" && (list.length ? <div className="mx-auto max-w-2xl space-y-5">{list.map((p) => <PostCard key={p.id} post={p} />)}</div> : <Card className="p-8 text-center text-sm text-ink-soft">No posts yet.</Card>)}
      {tab === "About" && (
        <Card className="p-4 sm:p-6"><dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {about.map(([Icon, k, v]) => (
            <div key={k} className="flex min-w-0 items-center gap-3 rounded-2xl bg-surface p-3.5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600"><Icon className="h-4 w-4" /></span><div className="min-w-0"><dt className="text-xs text-ink-soft">{k}</dt><dd className="truncate text-sm font-semibold">{v}</dd></div></div>
          ))}
        </dl></Card>
      )}
      {tab === "Donations" && (
        <Card className="p-4 sm:p-6"><ul className="space-y-3">
          {history.map(([h, dt], i) => (
            <li key={h} className="flex items-center gap-3 rounded-2xl bg-surface p-3.5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Building2 className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{h}</p><p className="text-xs text-ink-soft">{dt || d.last}</p></div><BloodBadge group={d.group} size="sm" /></li>
          ))}
        </ul></Card>
      )}
    </div>
  );
}
