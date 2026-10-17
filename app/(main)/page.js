import { Sparkles } from "lucide-react";
import HomeFeed from "@/components/HomeFeed";
import HeroSlider from "@/components/HeroSlider";
import UrgentRequests from "@/components/UrgentRequests";
import TopDonorsSlider from "@/components/TopDonorsSlider";

const slides = [
  {
    icon: "Droplet",
    tag: "১ ব্যাগ রক্ত = ১টি নতুন জীবন",
    title: "জরুরি রক্তের প্রয়োজনে",
    accent: "আমরা আপনার পাশে",
    text: "বাংলাদেশজুড়ে ৬৪ জেলার যেকোনো স্থানে মুহূর্তেই ভেরিফাইড রক্তদাতা খুঁজুন।",
    cta: [
      { label: "Request Blood", href: "/requests" },
      { label: "Find Donors", href: "/donors" },
    ],
  },
  {
    icon: "HeartHandshake",
    tag: "Become a Hero",
    title: "রক্ত দিন,",
    accent: "জীবন বাঁচান",
    text: "আজই ডোনার হিসেবে নিবন্ধন করুন এবং প্রয়োজনের সময় কারও পাশে দাঁড়ান।",
    cta: [
      { label: "Register as Donor", href: "/register" },
      { label: "Learn More", href: "/donors" },
    ],
  },
  {
    icon: "ShieldCheck",
    tag: "Verified & Trusted",
    title: "নিরাপদ ও দ্রুত",
    accent: "ডোনার যোগাযোগ",
    text: "এক ক্লিকে কল বা চ্যাট করে সরাসরি রক্তদাতার সাথে কথা বলুন।",
    cta: [
      { label: "Search Donors", href: "/donors" },
      { label: "Chat Now", href: "/chat" },
    ],
  },
];

export default function Home() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="mx-auto w-full min-w-0 max-w-2xl space-y-5 lg:max-w-none">
        <HeroSlider slides={slides} />
        <TopDonorsSlider />
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-bold">Latest Posts</h2>
        </div>
        <HomeFeed />
      </div>
      <aside className="hidden lg:block">
        <UrgentRequests />
      </aside>
    </div>
  );
}
