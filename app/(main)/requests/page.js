import { Building2, MapPin, Calendar, Phone, ArrowRight } from "lucide-react";
import { Segmented } from "@/components/Interactive";
import { BloodBadge, Button, Card, Field, Select, Status, statusTone } from "@/components/ui";
import { requests, bloodGroups, divisions, districts, upazilas } from "@/data";

export default function Requests() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card className="min-w-0 p-4 sm:p-8">
        <h1 className="text-3xl font-extrabold tracking-tight">রক্তের অনুরোধ</h1>
        <p className="mb-6 mt-1 text-ink-soft">রক্তদানের অনুরোধ করতে তথ্যগুলো পূরণ করুন</p>
        <div className="space-y-4">
          <Field label="রোগীর নাম" required placeholder="রোগীর নাম লিখুন" />
          <div className="grid grid-cols-2 gap-3"><Field label="বয়স" required type="number" placeholder="যেমন: ৩৫" /><Select label="রক্তের গ্রুপ" required options={bloodGroups} placeholder="গ্রুপ" /></div>
          <Field label="কত ব্যাগ রক্ত" required type="number" placeholder="যেমন: ২" />
          <Field label="হিমোগ্লোবিন" type="number" placeholder="যেমন: ১২.৫" suffix="%" />
          <Field label="হাসপাতালের নাম" required placeholder="হাসপাতালের নাম লিখুন" />
          <div className="grid gap-3 sm:grid-cols-3"><Select label="বিভাগ" required options={divisions} /><Select label="জেলা" required options={districts} /><Select label="উপজেলা" required options={upazilas} /></div>
          <Field label="যোগাযোগের নম্বর" required icon={Phone} type="tel" placeholder="+880 1XXX-XXXXXX" />
          <Segmented label="জরুরি অবস্থা" options={["Normal", "Urgent", "Very Urgent"]} initial={1} />
          <Field label="প্রয়োজনের তারিখ ও সময়" required type="datetime-local" />
          <Select label="কারণ" required options={["অপারেশন", "দুর্ঘটনা", "থ্যালাসেমিয়া", "ডেঙ্গু", "রক্তস্বল্পতা", "অন্যান্য"]} placeholder="যেমন: অপারেশন, দুর্ঘটনা" />
          <Field as="textarea" rows={3} label="বিবরণ" placeholder="রোগীর অবস্থা, ডাক্তারের পরামর্শ ইত্যাদি" />
          <Button size="lg" className="w-full">Submit Request <ArrowRight className="h-5 w-5" /></Button>
        </div>
      </Card>

      <div className="min-w-0 space-y-3">
        <h2 className="px-1 text-lg font-bold">সাম্প্রতিক অনুরোধ</h2>
        {requests.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div><p className="font-bold">{r.patient}</p><Status tone={statusTone[r.status]} className="mt-1.5">{r.status}</Status></div>
              <BloodBadge group={r.group} />
            </div>
            <div className="mt-4 space-y-2 text-sm text-ink-soft">
              <p className="flex items-center gap-2"><Building2 className="h-4 w-4" />{r.hospital}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{r.location}</p>
              <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />{r.date}</p>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full">View Details</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
