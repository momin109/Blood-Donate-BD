import HeroSlider from "@/components/HeroSlider";
import DonorsExplorer from "@/components/DonorsExplorer";
import { donors, districts, upazilas } from "@/data";

const slides = [
  {
    icon: "Users",
    tag: "Donor Directory",
    title: "সঠিক রক্তদাতা",
    accent: "দ্রুত খুঁজে নিন",
    text: "রক্তের গ্রুপ, জেলা ও উপজেলা অনুযায়ী ফিল্টার করুন।",
    cta: [{ label: "Request Blood", href: "/requests" }],
  },
  {
    icon: "CheckCircle2",
    tag: "Available Now",
    title: "এখনই প্রস্তুত",
    accent: "রক্তদাতারা",
    text: "Available ব্যাজ দেখে সরাসরি Call Now করুন।",
    cta: [{ label: "Chat Now", href: "/chat" }],
  },
  {
    icon: "Heart",
    tag: "Favorites",
    title: "প্রিয় ডোনারদের",
    accent: "সেভ করে রাখুন",
    text: "হার্ট আইকনে ট্যাপ করুন, প্রোফাইলে ফেভারিট দেখুন।",
    cta: [{ label: "View Profile", href: "/me" }],
  },
];

export default function Donors() {
  return (
    <div className="min-w-0 space-y-5">
      <HeroSlider slides={slides} />

      <DonorsExplorer
        donors={donors}
        districts={districts}
        upazilas={upazilas}
        urgentRequests={0}
      />
    </div>
  );
}
