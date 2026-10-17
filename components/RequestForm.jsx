"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight } from "lucide-react";
import { Segmented } from "@/components/Interactive";
import { Button, Card, Field, Select } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/client";
import { bloodGroups, upazilas } from "@/data";
import { DIVISION_NAMES, districtsOf } from "@/data/locations";

const REASONS = ["অপারেশন", "দুর্ঘটনা", "থ্যালাসেমিয়া", "ডেঙ্গু", "রক্তস্বল্পতা", "অন্যান্য"];
const URGENCIES = ["Normal", "Urgent", "Very Urgent"];
const empty = { patientName: "", age: "", bloodGroup: "", bags: "", hemoglobin: "", hospital: "", division: "", district: "", upazila: "", contactPhone: "", urgency: "Urgent", neededAt: "", reason: "", details: "" };

// নতুন রক্তের অনুরোধ → POST /api/requests
export default function RequestForm({ onCreated }) {
  const router = useRouter();
  const { user } = useAuth();
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [formKey, setFormKey] = useState(0); // সফল হলে Segmented রিসেট করতে

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const setDivision = (e) => setF((s) => ({ ...s, division: e.target.value, district: "" }));

  async function onSubmit(e) {
    e.preventDefault();
    if (!user) return router.push("/login?next=/requests");
    setBusy(true);
    setError("");
    setErrors({});
    setDone(false);
    try {
      const d = await api("/api/requests", { method: "POST", body: f });
      setF(empty);
      setFormKey((k) => k + 1);
      setDone(true);
      onCreated?.(d.request);
    } catch (err) {
      setError(err.message);
      setErrors(err.fieldErrors || {});
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="min-w-0 p-4 sm:p-8">
      <h1 className="text-3xl font-extrabold tracking-tight">রক্তের অনুরোধ</h1>
      <p className="mb-6 mt-1 text-ink-soft">রক্তদানের অনুরোধ করতে তথ্যগুলো পূরণ করুন</p>
      <form key={formKey} onSubmit={onSubmit} className="space-y-4">
        <Field label="রোগীর নাম" required placeholder="রোগীর নাম লিখুন" value={f.patientName} onChange={set("patientName")} error={errors.patientName} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="বয়স" required type="number" placeholder="যেমন: ৩৫" value={f.age} onChange={set("age")} error={errors.age} />
          <Select label="রক্তের গ্রুপ" required options={bloodGroups} placeholder="গ্রুপ" value={f.bloodGroup} onChange={set("bloodGroup")} error={errors.bloodGroup} />
        </div>
        <Field label="কত ব্যাগ রক্ত" required type="number" placeholder="যেমন: ২" value={f.bags} onChange={set("bags")} error={errors.bags} />
        <Field label="হিমোগ্লোবিন" type="number" step="0.1" placeholder="যেমন: ১২.৫" suffix="%" value={f.hemoglobin} onChange={set("hemoglobin")} error={errors.hemoglobin} />
        <Field label="হাসপাতালের নাম" required placeholder="হাসপাতালের নাম লিখুন" value={f.hospital} onChange={set("hospital")} error={errors.hospital} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Select label="বিভাগ" required options={DIVISION_NAMES} value={f.division} onChange={setDivision} error={errors.division} />
          <Select label="জেলা" required options={districtsOf(f.division)} value={f.district} onChange={set("district")} error={errors.district} />
          <Select label="উপজেলা" required options={upazilas} value={f.upazila} onChange={set("upazila")} error={errors.upazila} />
        </div>
        <Field label="যোগাযোগের নম্বর" required icon={Phone} type="tel" placeholder="+880 1XXX-XXXXXX" value={f.contactPhone} onChange={set("contactPhone")} error={errors.contactPhone} />
        <div>
          <Segmented label="জরুরি অবস্থা" options={URGENCIES} initial={1} onChange={(v) => setF((s) => ({ ...s, urgency: v }))} />
          {errors.urgency && <span className="mt-1 block text-xs text-brand-600">{errors.urgency}</span>}
        </div>
        <Field label="প্রয়োজনের তারিখ ও সময়" required type="datetime-local" value={f.neededAt} onChange={set("neededAt")} error={errors.neededAt} />
        <Select label="কারণ" required options={REASONS} placeholder="যেমন: অপারেশন, দুর্ঘটনা" value={f.reason} onChange={set("reason")} error={errors.reason} />
        <Field as="textarea" rows={3} label="বিবরণ" placeholder="রোগীর অবস্থা, ডাক্তারের পরামর্শ ইত্যাদি" value={f.details} onChange={set("details")} error={errors.details} />

        {!user && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            অনুরোধ জমা দিতে আগে <Link href="/login?next=/requests" className="font-bold underline">লগইন</Link> করুন।
          </p>
        )}
        {error && <p role="alert" className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{error}</p>}
        {done && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">আপনার অনুরোধ জমা হয়েছে এবং ডান পাশের তালিকায় যুক্ত হয়েছে।</p>}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "জমা হচ্ছে…" : <>Submit Request <ArrowRight className="h-5 w-5" /></>}
        </Button>
      </form>
    </Card>
  );
}
