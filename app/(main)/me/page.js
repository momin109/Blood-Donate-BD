"use client";
import { useState } from "react";
import Link from "next/link";
import { Camera, IdCard, LogOut, Droplet, MapPin, HeartPulse, Clock, Bookmark, Bell, Award, LifeBuoy, Settings, ChevronRight, BadgeCheck, UserRound } from "lucide-react";
import PostCard from "@/components/PostCard";
import { Avatar, Button, Card, Field, Select, Status, Switch, BloodBadge, statusTone } from "@/components/ui";
import { me, posts, requests, bloodGroups, districts, upazilas } from "@/data";

const menu = [[Clock, "আমার দান ইতিহাস", "/me"], [Bookmark, "সেভ করা অনুরোধ", "/requests"], [Bell, "নোটিফিকেশন সেটিংস", "/notifications"], [Award, "পুরস্কার ও ব্যাজ", "/me"], [IdCard, "ডোনার আইডি কার্ড", "/id-card"], [LifeBuoy, "সাহায্য ও সাপোর্ট", "/me"], [Settings, "সেটিংস", "/me"]];

export default function MyProfile() {
  const [on, setOn] = useState(me.available);
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <Card className="p-6 text-center">
            <div className="relative mx-auto w-fit">
              <Avatar name={me.name} size="xl" ring="ring-green-500" />
              <button className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white ring-4 ring-white"><Camera className="h-4 w-4" /></button>
            </div>
            <h1 className="mt-4 text-2xl font-extrabold">{me.name}</h1>
            <p className="flex items-center justify-center gap-1 text-sm text-ink-soft">দাতা · সদস্য since 2025 <BadgeCheck className="h-4 w-4 text-blue-500" /></p>
            <div className="mt-5 grid grid-cols-3 gap-2.5 text-left">
              <div className="rounded-2xl bg-brand-50 p-3"><Droplet className="h-5 w-5 fill-brand-600 text-brand-600" /><p className="mt-1.5 text-[11px] text-ink-soft">রক্তের গ্রুপ</p><p className="text-lg font-extrabold text-brand-700">{me.group}</p></div>
              <div className="rounded-2xl bg-green-50 p-3"><HeartPulse className="h-5 w-5 text-green-600" /><p className="mt-1.5 text-[11px] text-ink-soft">মোট দান</p><p className="text-lg font-extrabold text-green-700">{me.count} বার</p></div>
              <div className="rounded-2xl bg-blue-50 p-3"><MapPin className="h-5 w-5 text-blue-600" /><p className="mt-1.5 text-[11px] text-ink-soft">অবস্থান</p><p className="text-sm font-extrabold leading-tight text-blue-700">{me.district}</p></div>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface p-3.5 text-left">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700"><UserRound className="h-5 w-5" /></span>
              <div className="flex-1"><p className="font-semibold">আমি একজন রক্তদাতা</p><Status tone={on ? "success" : "neutral"} className="mt-0.5">{on ? "Available" : "Unavailable"}</Status></div>
              <Switch on={on} onChange={setOn} />
            </div>
          </Card>
          <Card className="overflow-hidden p-2">
            <p className="px-3 pb-1 pt-3 text-lg font-bold">মেনু</p>
            {menu.map(([Icon, l, h]) => (
              <Link key={l} href={h} className="flex items-center gap-3 rounded-2xl px-3 py-3.5 hover:bg-surface">
                <Icon className="h-5 w-5 text-ink-soft" /><span className="flex-1 text-[15px] font-medium">{l}</span><ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
          </Card>
          <Link href="/login" className="block"><Button size="lg" className="w-full"><LogOut className="h-5 w-5" />লগআউট</Button></Link>
        </div>

        <div className="space-y-5">
          <Card className="p-5 sm:p-7">
            <p className="mb-4 text-lg font-bold">প্রোফাইল এডিট</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="নাম" defaultValue={me.name} />
              <Field label="মোবাইল" defaultValue={me.phone} />
              <Select label="রক্তের গ্রুপ" options={bloodGroups} defaultValue="O+" />
              <Field label="শেষ রক্তদান" type="date" />
              <Select label="জেলা" options={districts} />
              <Select label="উপজেলা" options={upazilas} />
            </div>
            <Button className="mt-5">পরিবর্তন সংরক্ষণ করুন</Button>
          </Card>
          <Card className="p-5">
            <p className="mb-4 text-lg font-bold">আমার অনুরোধ</p>
            <ul className="space-y-3.5">
              {requests.slice(0, 3).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2.5"><BloodBadge group={r.group} size="sm" /><span className="truncate font-medium">{r.patient}</span></span>
                  <Status tone={statusTone[r.status]}>{r.status}</Status>
                </li>
              ))}
            </ul>
          </Card>
          <p className="px-1 text-lg font-bold">আমার পোস্ট</p>
          {posts.filter((p) => p.donorId === me.id).map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </div>
    </div>
  );
}
