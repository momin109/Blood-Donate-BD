import HeroSlider from "@/components/HeroSlider";
import RequestsBoard from "@/components/RequestsBoard";

const slides = [
  {
    icon: "Siren",
    tag: "Emergency Request",
    title: "জরুরি রক্তের",
    accent: "অনুরোধ করুন",
    text: "ফর্ম পূরণ করুন, ডোনাররা দ্রুত যোগাযোগ করবেন।",
    cta: [{ label: "Find Donors", href: "/donors" }],
  },
  {
    icon: "ShieldCheck",
    tag: "Verified Donors",
    title: "ভেরিফাইড",
    accent: "রক্তদাতা",
    text: "৬৪ জেলার ডোনারদের কাছে আপনার অনুরোধ পৌঁছে দিন।",
    cta: [{ label: "Chat Now", href: "/chat" }],
  },
];

export default function Requests() {
  return (
    <div className="min-w-0 space-y-5">
      <HeroSlider slides={slides} />
      <RequestsBoard />
    </div>
  );
}
