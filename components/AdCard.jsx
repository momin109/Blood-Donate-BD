import { Megaphone, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui";

// Advertisement slot UI (static placeholder; real ad delivery needs backend support)
const ads = [
  { title: "Your Brand Here", text: "Reach thousands of donors and volunteers across Bangladesh.", cta: "Advertise With Us", tone: "from-indigo-600 to-blue-500" },
  { title: "Health Checkup Package", text: "Special discount on full-body health screening this month.", cta: "Learn More", tone: "from-emerald-600 to-teal-500" },
];

export default function AdCard({ index = 0 }) {
  const a = ads[index % ads.length];
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 sm:px-5">
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Sponsored</span>
        <Megaphone className="h-4 w-4 text-gray-300" />
      </div>
      <div className={`m-3 flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-br ${a.tone} p-4 text-white sm:m-4 sm:p-6`}>
        <div className="min-w-0">
          <p className="text-lg font-extrabold leading-tight sm:text-xl">{a.title}</p>
          <p className="mt-1 text-sm text-white/85">{a.text}</p>
        </div>
        <span className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-semibold text-ink">{a.cta}<ArrowUpRight className="h-4 w-4" /></span>
      </div>
    </Card>
  );
}
