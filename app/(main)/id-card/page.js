import { Droplet, QrCode, MapPin, Phone, Globe } from "lucide-react";
import { Avatar } from "@/components/ui";
import { me } from "@/data";

export default function IdCard() {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-ink-soft no-print">প্রিভিউ — ডাউনলোড ফিচার পরের ধাপে যুক্ত হবে।</p>
      <div className="w-full max-w-[400px] overflow-hidden rounded-2xl border-4 border-brand-700 bg-white shadow-float">
        <div className="flex items-center justify-between bg-gradient-to-r from-brand-800 to-brand-600 px-5 py-4 text-white">
          <div className="flex items-center gap-2"><Droplet className="h-6 w-6 fill-white" /><span className="font-bold">Blood Donate BD</span></div>
          <span className="text-xs font-semibold tracking-wide">BLOOD DONOR ID CARD</span>
        </div>
        <div className="relative p-5">
          <div className="flex items-center gap-4">
            <div className="rounded-full border-4 border-brand-600 p-1"><Avatar name={me.name} size="xl" /></div>
            <div className="min-w-0">
              <p className="text-xl font-bold leading-tight">{me.name}</p>
              <p className="mt-1 font-mono text-sm text-ink-soft">{me.donorId}</p>
              <div className="mt-2 inline-flex items-baseline gap-1 rounded-xl bg-brand-600 px-4 py-1 text-white"><Droplet className="h-5 w-5 self-center fill-white" /><span className="text-4xl font-extrabold">{me.group}</span></div>
            </div>
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div className="space-y-1.5 text-sm">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-600" />{me.district}, {me.upazila}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand-600" />{me.phone}</p>
              <p className="text-xs text-ink-soft">Issued: 10 Oct 2026 · Validity: 5 Years</p>
            </div>
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-300"><QrCode className="h-14 w-14" /></div>
          </div>
        </div>
        <div className="flex items-center justify-between bg-brand-50 px-5 py-3 text-xs">
          <span className="flex items-center gap-1.5 text-ink-soft"><Globe className="h-3.5 w-3.5" />www.blooddonatebd.com</span>
          <span className="font-bold text-brand-700">Proud Blood Donor</span>
        </div>
      </div>
    </div>
  );
}
