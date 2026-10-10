import Link from "next/link";
import { Camera, Phone, Droplet } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import PasswordField from "@/components/PasswordField";
import { Button, Field, Select } from "@/components/ui";
import { bloodGroups, divisions, districts, upazilas } from "@/data";

export default function Register() {
  return (
    <AuthShell title="ডোনার হোন" sub="রক্তদাতা হিসেবে যুক্ত হয়ে জীবন বাঁচাতে সাহায্য করুন">
      <div className="space-y-4">
        <button className="mx-auto flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed border-brand-300 bg-brand-50 text-xs font-medium text-brand-700"><Camera className="h-6 w-6" />ছবি যোগ করুন</button>
        <Field label="পুরো নাম" required placeholder="আপনার পুরো নাম লিখুন" />
        <Field label="মোবাইল নম্বর" required icon={Phone} type="tel" placeholder="+880 1XXXX-XXXXXX" error="সঠিক মোবাইল নম্বর দিন" />
        <PasswordField label="পাসওয়ার্ড" />
        <PasswordField label="পাসওয়ার্ড নিশ্চিত করুন" error="পাসওয়ার্ড মিলছে না" />
        <Field label="সর্বশেষ রক্তদানের তারিখ" type="date" />
        <Field label="এলাকা / গ্রাম" placeholder="এলাকা বা গ্রামের নাম" />
        <Select label="বিভাগ" required options={divisions} placeholder="বিভাগ নির্বাচন" />
        <Select label="জেলা" required options={districts} placeholder="জেলা নির্বাচন" />
        <Select label="উপজেলা" required options={upazilas} placeholder="উপজেলা নির্বাচন" />
        <Select label="রক্তের গ্রুপ" required options={bloodGroups} placeholder="রক্তের গ্রুপ বাছুন" />
        <label className="flex items-start gap-2.5 text-sm text-ink-soft"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-600" />আমি শর্তাবলী ও গোপনীয়তা নীতিতে সম্মত।</label>
        <Button size="lg" className="w-full"><Droplet className="h-5 w-5 fill-white" />ডোনার হিসেবে নিবন্ধন করুন</Button>
        <p className="text-center text-sm text-ink-soft">আগে থেকেই অ্যাকাউন্ট আছে? <Link href="/login" className="font-semibold text-brand-600 hover:underline">লগইন করুন</Link></p>
      </div>
    </AuthShell>
  );
}
