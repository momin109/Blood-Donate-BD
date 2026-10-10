import Link from "next/link";
import { Droplet, Plus, Users, Search, Siren, Sparkles } from "lucide-react";
import Composer from "@/components/Composer";
import PostCard from "@/components/PostCard";
import { BloodChips } from "@/components/Interactive";
import { BloodBadge, Button, Card, Select } from "@/components/ui";
import { posts, requests, districts, upazilas } from "@/data";

export default function Home() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="mx-auto w-full max-w-xl space-y-4 lg:max-w-none">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-6 text-white shadow-float sm:p-8">
          <span className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
          <span className="absolute -bottom-16 right-10 h-40 w-40 rounded-full bg-black/10" />
          <span className="relative inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-medium"><Droplet className="h-4 w-4 fill-white" />১ ব্যাগ রক্ত = ১টি নতুন জীবন</span>
          <h1 className="relative mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">জরুরি রক্তের প্রয়োজনে<br /><span className="text-yellow-300">আমরা আপনার পাশে</span></h1>
          <p className="relative mt-3 max-w-md text-sm text-white/85">বাংলাদেশজুড়ে ৬৪ জেলার যেকোনো স্থানে মুহূর্তেই ভেরিফাইড রক্তদাতা খুঁজুন।</p>
          <div className="relative mt-5 grid grid-cols-2 gap-3 sm:max-w-md">
            <Link href="/requests"><Button variant="white" size="lg" className="w-full px-3 text-sm"><Plus className="h-5 w-5" />রক্তের অনুরোধ</Button></Link>
            <Link href="/donors"><Button variant="glass" size="lg" className="w-full px-3 text-sm"><Users className="h-5 w-5" />ডোনার তালিকা</Button></Link>
          </div>
        </section>

        <Card className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Search className="h-5 w-5" /></span>
            <div className="flex-1"><p className="font-bold">দ্রুত রক্তদাতা সার্চ</p></div><span className="text-xs text-ink-soft">৩টি সহজ ধাপে খুঁজুন</span>
          </div>
          <BloodChips label="১. রক্তের গ্রুপ নির্বাচন করুন:" />
          <div className="grid grid-cols-2 gap-3"><Select label="২. জেলা:" options={districts} placeholder="ঢাকা" /><Select label="৩. উপজেলা:" options={upazilas} placeholder="সকল উপজেলা" /></div>
          <Link href="/donors" className="block"><Button size="lg" className="w-full"><Search className="h-5 w-5" />ডোনার খুঁজুন</Button></Link>
        </Card>

        <div className="flex items-center gap-2 px-1 pt-2"><Sparkles className="h-5 w-5 text-brand-600" /><h2 className="font-bold">সাম্প্রতিক পোস্ট</h2></div>
        <Composer />
        {posts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>

      <aside className="hidden space-y-4 lg:block">
        <Card className="sticky top-20 p-5">
          <p className="mb-4 flex items-center gap-2 font-bold"><Siren className="h-5 w-5 text-brand-600" />জরুরি অনুরোধ</p>
          <ul className="space-y-4">
            {requests.slice(0, 3).map((r) => (
              <li key={r.id} className="flex items-center gap-3">
                <BloodBadge group={r.group} size="sm" />
                <div className="min-w-0"><p className="truncate text-sm font-semibold">{r.patient}</p><p className="truncate text-xs text-ink-soft">{r.hospital}</p></div>
              </li>
            ))}
          </ul>
          <Link href="/requests" className="mt-5 block text-sm font-semibold text-brand-600 hover:underline">সব অনুরোধ দেখুন</Link>
        </Card>
      </aside>
    </div>
  );
}
