"use client";
import { useState } from "react";
import Link from "next/link";
import { Camera, IdCard, LogOut, Droplet, MapPin, HeartPulse, Heart, Clock, Bookmark, Bell, Award, LifeBuoy, Settings, ChevronRight, BadgeCheck, UserRound, MessageCircle, Facebook, Users, Flag, MessagesSquare, Phone, Mail, Globe, Code2, ExternalLink } from "lucide-react";
import PostCard from "@/components/PostCard";
import { useFavs, FavButton } from "@/components/Favorites";
import { Avatar, Button, Card, Field, Select, Status, Switch, BloodBadge, statusTone } from "@/components/ui";
import { me, posts, requests, donors, contact, developer, bloodGroups, districts, upazilas } from "@/data";

const menu = [[Clock, "My Donation History", "/me"], [Bookmark, "Saved Requests", "/requests"], [Bell, "Notification Settings", "/notifications"], [Award, "Awards & Badges", "/me"], [IdCard, "Donor ID Card", "/id-card"], [LifeBuoy, "Help & Support", "/me"], [Settings, "Settings", "/me"]];
const links = [
  [MessageCircle, "WhatsApp", "Chat with us", contact.whatsapp, "bg-green-50 text-green-600"],
  [MessagesSquare, "Messenger", "Facebook Messenger", contact.messenger, "bg-blue-50 text-blue-600"],
  [Facebook, "Facebook", "Our profile", contact.facebook, "bg-indigo-50 text-indigo-600"],
  [Flag, "Facebook Page", "Follow our page", contact.page, "bg-sky-50 text-sky-600"],
  [Users, "Facebook Group", "Join the community", contact.group, "bg-violet-50 text-violet-600"],
];

export default function MyProfile() {
  const [on, setOn] = useState(me.available);
  const { favs } = useFavs();
  const favDonors = donors.filter((d) => favs.includes(d.id));
  const tiles = [[Droplet, "Blood Group", me.group, "bg-brand-50 text-brand-700"], [HeartPulse, "Total Donations", `${me.count}x`, "bg-green-50 text-green-700"], [Heart, "Favorites", favs.length, "bg-pink-50 text-pink-700"], [MapPin, "Location", me.district, "bg-blue-50 text-blue-700"]];
  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[380px_1fr]">
      <div className="min-w-0 space-y-5">
        <Card className="p-5 text-center sm:p-6">
          <div className="relative mx-auto w-fit">
            <Avatar name={me.name} size="xl" ring="ring-green-500" />
            <button className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white ring-4 ring-white" aria-label="Change photo"><Camera className="h-4 w-4" /></button>
          </div>
          <h1 className="mt-4 text-2xl font-extrabold">{me.name}</h1>
          <p className="flex items-center justify-center gap-1 text-sm text-ink-soft">Donor · Member since 2025 <BadgeCheck className="h-4 w-4 text-blue-500" /></p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-left">
            {tiles.map(([Icon, l, v, c]) => (
              <div key={l} className={"rounded-2xl p-4 " + c}><Icon className="h-5 w-5" /><p className="mt-2 text-xs opacity-70">{l}</p><p className="text-xl font-extrabold">{v}</p></div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface p-3.5 text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700"><UserRound className="h-5 w-5" /></span>
            <div className="flex-1"><p className="font-semibold">আমি একজন রক্তদাতা</p><Status tone={on ? "success" : "neutral"} className="mt-0.5">{on ? "Available" : "Unavailable"}</Status></div>
            <Switch on={on} onChange={setOn} />
          </div>
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
                <li key={d.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3">
                  <Avatar name={d.name} online={d.available} />
                  <div className="min-w-0 flex-1"><Link href={`/donors/${d.id}`} className="block truncate font-semibold hover:underline">{d.name}</Link><p className="text-xs text-ink-soft">{d.district}, {d.upazila}</p></div>
                  <BloodBadge group={d.group} size="sm" />
                  <a href={`tel:${d.phone}`} aria-label="Call" className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700"><Phone className="h-4 w-4" /></a>
                  <FavButton id={d.id} />
                </li>
              ))}
            </ul>
          ) : <p className="py-6 text-center text-sm text-ink-soft">No favorites yet. Tap the heart on a donor card.</p>}
        </Card>

        <Card className="p-5 sm:p-6">
          <p className="mb-4 text-lg font-bold">Connect With Us</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {links.map(([Icon, t, s, href, c]) => (
              <a key={t} href={href} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-2xl border border-gray-100 p-3.5 transition hover:border-brand-200 hover:shadow-card">
                <span className={"flex h-11 w-11 items-center justify-center rounded-xl " + c}><Icon className="h-5 w-5" /></span>
                <span className="flex-1"><span className="block font-semibold">{t}</span><span className="block text-xs text-ink-soft">{s}</span></span>
                <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-brand-600" />
              </a>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-950 p-6 text-white">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60"><Code2 className="h-4 w-4" />Developer Information</p>
            <div className="flex items-center gap-4">
              <Avatar name={developer.name} size="lg" />
              <div><p className="text-xl font-bold">{developer.name}</p><p className="text-sm text-white/70">{developer.role}</p></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">{developer.stack.map((s) => <span key={s} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">{s}</span>)}</div>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <a href={`mailto:${developer.email}`} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 hover:bg-white/20"><Mail className="h-4 w-4" />{developer.email}</a>
              <a href={developer.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 hover:bg-white/20"><Globe className="h-4 w-4" />Portfolio</a>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <p className="mb-4 text-lg font-bold">Edit Profile</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="নাম" defaultValue={me.name} /><Field label="মোবাইল" defaultValue={me.phone} />
            <Select label="রক্তের গ্রুপ" options={bloodGroups} defaultValue="O+" /><Field label="শেষ রক্তদান" type="date" />
            <Select label="জেলা" options={districts} /><Select label="উপজেলা" options={upazilas} />
          </div>
          <Button className="mt-5">Save Changes</Button>
        </Card>

        <Card className="p-5">
          <p className="mb-4 text-lg font-bold">My Requests</p>
          <ul className="space-y-3.5">
            {requests.slice(0, 3).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 text-sm"><span className="flex min-w-0 items-center gap-2.5"><BloodBadge group={r.group} size="sm" /><span className="truncate font-medium">{r.patient}</span></span><Status tone={statusTone[r.status]}>{r.status}</Status></li>
            ))}
          </ul>
        </Card>
        <p className="px-1 text-lg font-bold">My Posts</p>
        {posts.filter((p) => p.donorId === me.id).map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}
