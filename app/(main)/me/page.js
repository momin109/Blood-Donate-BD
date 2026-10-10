"use client";
import { useState } from "react";
import Link from "next/link";
import { IdCard, LogOut, Heart, Clock, Bookmark, Bell, Award, LifeBuoy, Settings, ChevronRight, UserRound, Phone } from "lucide-react";
import CommunityLinks from "@/components/CommunityLinks";
import DeveloperInfo from "@/components/DeveloperInfo";
import ProfileView from "@/components/ProfileView";
import { useFavs, FavButton } from "@/components/Favorites";
import { Avatar, Button, Card, Field, Select, Status, Switch, BloodBadge, statusTone } from "@/components/ui";
import { me, requests, donors, bloodGroups, districts, upazilas } from "@/data";

const menu = [[Clock, "My Donation History", "/me"], [Bookmark, "Saved Requests", "/requests"], [Bell, "Notification Settings", "/notifications"], [Award, "Awards & Badges", "/me"], [IdCard, "Donor ID Card", "/id-card"], [LifeBuoy, "Help & Support", "/me"], [Settings, "Settings", "/me"]];

export default function MyProfile() {
  const [on, setOn] = useState(me.available);
  const { favs } = useFavs();
  const favDonors = donors.filter((d) => favs.includes(d.id));
  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-5">
      <ProfileView donorId={me.id} own />

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className="min-w-0 space-y-5">
          <Card className="flex items-center gap-3 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700"><UserRound className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1"><p className="font-semibold">আমি একজন রক্তদাতা</p><Status tone={on ? "success" : "neutral"} className="mt-0.5">{on ? "Available" : "Unavailable"}</Status></div>
            <Switch on={on} onChange={setOn} />
          </Card>
          <Card className="p-2">
            <p className="px-3 pb-1 pt-3 text-lg font-bold">Menu</p>
            {menu.map(([Icon, l, h]) => (
              <Link key={l} href={h} className="flex items-center gap-3 rounded-2xl px-3 py-3.5 hover:bg-surface"><Icon className="h-5 w-5 text-ink-soft" /><span className="flex-1 text-[15px] font-medium">{l}</span><ChevronRight className="h-4 w-4 text-gray-400" /></Link>
            ))}
          </Card>
          <Link href="/login" className="block"><Button size="lg" className="w-full"><LogOut className="h-5 w-5" />Logout</Button></Link>
        </div>

        <div className="min-w-0 space-y-5">
          <Card className="p-4 sm:p-6">
            <p className="mb-4 flex items-center gap-2 text-lg font-bold"><Heart className="h-5 w-5 fill-brand-600 text-brand-600" />Favorite Donors <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm text-brand-700">{favs.length}</span></p>
            {favDonors.length ? (
              <ul className="space-y-3">
                {favDonors.map((d) => (
                  <li key={d.id} className="flex items-center gap-2.5 rounded-2xl bg-surface p-3 sm:gap-3">
                    <Avatar name={d.name} online={d.available} />
                    <div className="min-w-0 flex-1"><Link href={`/donors/${d.id}`} className="block truncate font-semibold hover:underline">{d.name}</Link><p className="truncate text-xs text-ink-soft">{d.district}, {d.upazila}</p></div>
                    <BloodBadge group={d.group} size="sm" className="shrink-0" />
                    <a href={`tel:${d.phone}`} aria-label="Call" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700"><Phone className="h-4 w-4" /></a>
                    <FavButton id={d.id} className="shrink-0" />
                  </li>
                ))}
              </ul>
            ) : <p className="py-6 text-center text-sm text-ink-soft">No favorites yet. Tap the heart on a donor card.</p>}
          </Card>
          <Card className="p-4 sm:p-6">
            <p className="mb-4 text-lg font-bold">Edit Profile</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="নাম" defaultValue={me.name} /><Field label="মোবাইল" defaultValue={me.phone} />
              <Select label="রক্তের গ্রুপ" options={bloodGroups} defaultValue="O+" /><Field label="শেষ রক্তদান" type="date" />
              <Select label="জেলা" options={districts} /><Select label="উপজেলা" options={upazilas} />
            </div>
            <Button className="mt-5">Save Changes</Button>
          </Card>
          <Card className="p-4 sm:p-5">
            <p className="mb-4 text-lg font-bold">My Requests</p>
            <ul className="space-y-3.5">
              {requests.slice(0, 3).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 text-sm"><span className="flex min-w-0 items-center gap-2.5"><BloodBadge group={r.group} size="sm" className="shrink-0" /><span className="truncate font-medium">{r.patient}</span></span><Status tone={statusTone[r.status]}>{r.status}</Status></li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Bottom: company + community links, then Developer Information toggle */}
      <CommunityLinks />
      <DeveloperInfo />
    </div>
  );
}
