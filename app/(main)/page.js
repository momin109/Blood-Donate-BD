import Link from "next/link";
import { Droplet, Search, Siren, Sparkles, HeartHandshake, ShieldCheck } from "lucide-react";
import Composer from "@/components/Composer";
import HeroSlider from "@/components/HeroSlider";
import PostCard from "@/components/PostCard";
import { BloodChips } from "@/components/Interactive";
import { BloodBadge, Button, Card, Select } from "@/components/ui";
import { posts, requests, districts, upazilas } from "@/data";

const slides = [
  { icon: "Droplet", tag: "১ ব্যাগ রক্ত = ১টি নতুন জীবন", title: "জরুরি রক্তের প্রয়োজনে", accent: "আমরা আপনার পাশে", text: "বাংলাদেশজুড়ে ৬৪ জেলার যেকোনো স্থানে মুহূর্তেই ভেরিফাইড রক্তদাতা খুঁজুন।", cta: [{ label: "Request Blood", href: "/requests" }, { label: "Find Donors", href: "/donors" }] },
  { icon: "HeartHandshake", tag: "Become a Hero", title: "রক্ত দিন,", accent: "জীবন বাঁচান", text: "আজই ডোনার হিসেবে নিবন্ধন করুন এবং প্রয়োজনের সময় কারও পাশে দাঁড়ান।", cta: [{ label: "Register as Donor", href: "/register" }, { label: "Learn More", href: "/donors" }] },
  { icon: "ShieldCheck", tag: "Verified & Trusted", title: "নিরাপদ ও দ্রুত", accent: "ডোনার যোগাযোগ", text: "এক ক্লিকে কল বা চ্যাট করে সরাসরি রক্তদাতার সাথে কথা বলুন।", cta: [{ label: "Search Donors", href: "/donors" }, { label: "Chat Now", href: "/chat" }] },
];

export default function Home() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="mx-auto w-full min-w-0 max-w-2xl space-y-5 lg:max-w-none">
        <HeroSlider slides={slides} />
        <Card className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Search className="h-5 w-5" /></span>
            <div className="flex-1"><p className="font-bold">দ্রুত রক্তদাতা সার্চ</p><p className="text-xs text-ink-soft">৩টি সহজ ধাপে খুঁজুন</p></div>
          </div>
          <BloodChips label="১. রক্তের গ্রুপ নির্বাচন করুন:" />
          <div className="grid grid-cols-2 gap-3"><Select label="২. জেলা:" options={districts} placeholder="ঢাকা" /><Select label="৩. উপজেলা:" options={upazilas} placeholder="সকল উপজেলা" /></div>
          <Link href="/donors" className="block"><Button size="lg" className="w-full"><Search className="h-5 w-5" />Search Donors</Button></Link>
        </Card>
        <div className="flex items-center gap-2 px-1 pt-1"><Sparkles className="h-5 w-5 text-brand-600" /><h2 className="text-lg font-bold">Latest Posts</h2></div>
        <Composer />
        {posts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
      <aside className="hidden lg:block">
        <Card className="sticky top-24 p-5">
          <p className="mb-4 flex items-center gap-2 font-bold"><Siren className="h-5 w-5 text-brand-600" />Urgent Requests</p>
          <ul className="space-y-4">
            {requests.slice(0, 3).map((r) => (
              <li key={r.id} className="flex items-center gap-3"><BloodBadge group={r.group} size="sm" /><div className="min-w-0"><p className="truncate text-sm font-semibold">{r.patient}</p><p className="truncate text-xs text-ink-soft">{r.hospital}</p></div></li>
            ))}
          </ul>
          <Link href="/requests" className="mt-5 block text-sm font-semibold text-brand-600 hover:underline">View all requests →</Link>
        </Card>
      </aside>
    </div>
  );
}
