import { Search, X, Users, CheckCircle2, Heart, SlidersHorizontal, ChevronDown } from "lucide-react";
import DonorCard from "@/components/DonorCard";
import HeroSlider from "@/components/HeroSlider";
import { BloodChips } from "@/components/Interactive";
import { Button, Card, Select } from "@/components/ui";
import { donors, districts, upazilas } from "@/data";

const slides = [
  { icon: "Users", tag: "Donor Directory", title: "সঠিক রক্তদাতা", accent: "দ্রুত খুঁজে নিন", text: "রক্তের গ্রুপ, জেলা ও উপজেলা অনুযায়ী ফিল্টার করুন।", cta: [{ label: "Request Blood", href: "/requests" }] },
  { icon: "CheckCircle2", tag: "Available Now", title: "এখনই প্রস্তুত", accent: "রক্তদাতারা", text: "Available ব্যাজ দেখে সরাসরি Call Now করুন।", cta: [{ label: "Chat Now", href: "/chat" }] },
  { icon: "Heart", tag: "Favorites", title: "প্রিয় ডোনারদের", accent: "সেভ করে রাখুন", text: "হার্ট আইকনে ট্যাপ করুন, প্রোফাইলে ফেভারিট দেখুন।", cta: [{ label: "View Profile", href: "/me" }] },
];

function Filters() {
  return (
    <div className="space-y-4">
      <BloodChips label="রক্তের গ্রুপ" />
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"><Select label="জেলা" options={districts} /><Select label="উপজেলা" options={upazilas} /><Select label="Availability" options={["Available", "Unavailable"]} /></div>
      <div className="flex gap-2"><Button className="flex-1"><Search className="h-4 w-4" />Search</Button><Button variant="outline" className="flex-1"><X className="h-4 w-4" />Clear</Button></div>
    </div>
  );
}

export default function Donors() {
  return (
    <div className="min-w-0 space-y-5">
      <HeroSlider slides={slides} compact />
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <details className="group lg:hidden">
          <summary className="flex h-14 cursor-pointer list-none items-center gap-3 rounded-3xl bg-white px-5 font-semibold shadow-card [&::-webkit-details-marker]:hidden">
            <SlidersHorizontal className="h-5 w-5 text-brand-600" />Filters<ChevronDown className="ml-auto h-5 w-5 text-ink-soft transition group-open:rotate-180" />
          </summary>
          <Card className="mt-3 p-4 sm:p-5"><Filters /></Card>
        </details>
        <Card className="sticky top-24 hidden h-fit p-5 lg:block"><p className="mb-4 text-lg font-bold">Find Donors</p><Filters /></Card>
        <div className="min-w-0">
          <p className="mb-3 px-1 text-sm text-ink-soft">{donors.length} donors found</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{donors.map((d) => <DonorCard key={d.id} donor={d} />)}</div>
        </div>
      </div>
    </div>
  );
}
