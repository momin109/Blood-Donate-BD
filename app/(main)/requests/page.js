import { Phone, ArrowRight } from "lucide-react";
import HeroSlider from "@/components/HeroSlider";
import RequestCard from "@/components/RequestCard";
import { Segmented } from "@/components/Interactive";
import { Button, Card, Field, Select } from "@/components/ui";
import { requests, bloodGroups, divisions, districts, upazilas } from "@/data";

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
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="min-w-0 p-4 sm:p-8">
          <h1 className="text-3xl font-extrabold tracking-tight">
            রক্তের অনুরোধ
          </h1>
          <p className="mb-6 mt-1 text-ink-soft">
            রক্তদানের অনুরোধ করতে তথ্যগুলো পূরণ করুন
          </p>
          <div className="space-y-4">
            <Field label="রোগীর নাম" required placeholder="রোগীর নাম লিখুন" />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="বয়স"
                required
                type="number"
                placeholder="যেমন: ৩৫"
              />
              <Select
                label="রক্তের গ্রুপ"
                required
                options={bloodGroups}
                placeholder="গ্রুপ"
              />
            </div>
            <Field
              label="কত ব্যাগ রক্ত"
              required
              type="number"
              placeholder="যেমন: ২"
            />
            <Field
              label="হিমোগ্লোবিন"
              type="number"
              placeholder="যেমন: ১২.৫"
              suffix="%"
            />
            <Field
              label="হাসপাতালের নাম"
              required
              placeholder="হাসপাতালের নাম লিখুন"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <Select label="বিভাগ" required options={divisions} />
              <Select label="জেলা" required options={districts} />
              <Select label="উপজেলা" required options={upazilas} />
            </div>
            <Field
              label="যোগাযোগের নম্বর"
              required
              icon={Phone}
              type="tel"
              placeholder="+880 1XXX-XXXXXX"
            />
            <Segmented
              label="জরুরি অবস্থা"
              options={["Normal", "Urgent", "Very Urgent"]}
              initial={1}
            />
            <Field
              label="প্রয়োজনের তারিখ ও সময়"
              required
              type="datetime-local"
            />
            <Select
              label="কারণ"
              required
              options={[
                "অপারেশন",
                "দুর্ঘটনা",
                "থ্যালাসেমিয়া",
                "ডেঙ্গু",
                "রক্তস্বল্পতা",
                "অন্যান্য",
              ]}
              placeholder="যেমন: অপারেশন, দুর্ঘটনা"
            />
            <Field
              as="textarea"
              rows={3}
              label="বিবরণ"
              placeholder="রোগীর অবস্থা, ডাক্তারের পরামর্শ ইত্যাদি"
            />
            <Button size="lg" className="w-full">
              Submit Request <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>

        <div className="min-w-0 space-y-4">
          <h2 className="px-1 text-lg font-bold">সাম্প্রতিক অনুরোধ</h2>
          {requests.map((r) => (
            <RequestCard key={r.id} request={r} />
          ))}
        </div>
      </div>
    </div>
  );
}
