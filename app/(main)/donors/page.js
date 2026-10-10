import { Search, X } from "lucide-react";
import DonorCard from "@/components/DonorCard";
import { BloodChips } from "@/components/Interactive";
import { Button, Card, Select } from "@/components/ui";
import { donors, districts, upazilas } from "@/data";

export default function Donors() {
  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <Card className="h-fit space-y-4 p-5 lg:sticky lg:top-20">
        <p className="text-lg font-bold">ডোনার খুঁজুন</p>
        <BloodChips label="রক্তের গ্রুপ" />
        <Select label="জেলা" options={districts} />
        <Select label="উপজেলা" options={upazilas} />
        <Select label="Availability" options={["Available", "Unavailable"]} />
        <div className="flex gap-2"><Button className="flex-1"><Search className="h-4 w-4" />খুঁজুন</Button><Button variant="outline" className="flex-1"><X className="h-4 w-4" />মুছুন</Button></div>
      </Card>
      <div>
        <p className="mb-3 px-1 text-sm text-ink-soft">{donors.length} জন ডোনার পাওয়া গেছে</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{donors.map((d) => <DonorCard key={d.id} donor={d} />)}</div>
      </div>
    </div>
  );
}
