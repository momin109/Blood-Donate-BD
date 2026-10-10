import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import PasswordField from "@/components/PasswordField";
import { Phone } from "lucide-react";
import { Button, Field } from "@/components/ui";

export default function Login() {
  return (
    <AuthShell title="স্বাগতম" sub="আপনার অ্যাকাউন্টে লগইন করুন">
      <div className="space-y-4">
        <Field label="মোবাইল নম্বর" icon={Phone} type="tel" placeholder="+880 1XXXX-XXXXXX" />
        <PasswordField label="পাসওয়ার্ড" />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-brand-600" /> মনে রাখুন</label>
          <Link href="#" className="font-semibold text-brand-600 hover:underline">পাসওয়ার্ড ভুলে গেছেন?</Link>
        </div>
        <Link href="/" className="block"><Button size="lg" className="w-full">লগইন করুন</Button></Link>
        <p className="text-center text-sm text-ink-soft">অ্যাকাউন্ট নেই? <Link href="/register" className="font-semibold text-brand-600 hover:underline">রেজিস্ট্রেশন করুন</Link></p>
      </div>
    </AuthShell>
  );
}
