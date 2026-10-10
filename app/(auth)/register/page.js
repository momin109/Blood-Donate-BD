import Link from "next/link";
import { Phone, Droplet } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import PasswordField from "@/components/PasswordField";
import { Button, Field, Select } from "@/components/ui";
import { bloodGroups, divisionsEn, districtsEn, upazilasEn } from "@/data";

export default function Register() {
  return (
    <AuthShell title="Become a Donor" sub="Join as a blood donor and help save lives">
      <div className="space-y-4">
        <Field label="Full Name" required placeholder="Enter your full name" />
        <Field label="Mobile Number" required icon={Phone} type="tel" placeholder="+880 1XXXX-XXXXXX" error="Enter a valid mobile number" />
        <PasswordField label="Password" />
        <PasswordField label="Confirm Password" error="Passwords do not match" />
        <Field label="Last Donation Date" type="date" />
        {/* Two fields per row; stacks on very small screens */}
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
          <Field label="Village / Area" required placeholder="Enter village or area" />
          <Select label="Division" required options={divisionsEn} placeholder="Select division" />
          <Select label="District" required options={districtsEn} placeholder="Select district" />
          <Select label="Upazila" required options={upazilasEn} placeholder="Select upazila" />
        </div>
        <Select label="Blood Group" required options={bloodGroups} placeholder="Choose blood group" />
        <label className="flex items-start gap-2.5 text-sm text-ink-soft"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-600" />I agree to the Terms &amp; Conditions and Privacy Policy.</label>
        <Button size="lg" className="w-full"><Droplet className="h-5 w-5 fill-white" />Register as Donor</Button>
        <p className="text-center text-sm text-ink-soft">Already have an account? <Link href="/login" className="font-semibold text-brand-600 hover:underline">Login</Link></p>
      </div>
    </AuthShell>
  );
}
