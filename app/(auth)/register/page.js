"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, Droplet } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import PasswordField from "@/components/PasswordField";
import { Button, Field, Select } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import { bloodGroups, upazilas } from "@/data";
import { DIVISION_NAMES, districtsOf } from "@/data/locations";

const empty = { name: "", phone: "", password: "", confirmPassword: "", lastDonationDate: "", area: "", division: "", district: "", upazila: "", bloodGroup: "", terms: false };

export default function Register() {
  const router = useRouter();
  const { user, loading, register } = useAuth();
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const setDivision = (e) => setF((s) => ({ ...s, division: e.target.value, district: "" })); // বিভাগ বদলালে জেলা রিসেট

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setErrors({});
    try {
      await register(f);
      router.replace("/");
    } catch (err) {
      setError(err.message);
      setErrors(err.fieldErrors || {});
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Become a Donor" sub="Join as a blood donor and help save lives">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Full Name" required placeholder="Enter your full name" value={f.name} onChange={set("name")} error={errors.name} />
        <Field label="Mobile Number" required icon={Phone} type="tel" placeholder="+880 1XXXX-XXXXXX" value={f.phone} onChange={set("phone")} error={errors.phone} />
        <PasswordField label="Password" autoComplete="new-password" value={f.password} onChange={set("password")} error={errors.password} />
        <PasswordField label="Confirm Password" autoComplete="new-password" value={f.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />
        <Field label="Last Donation Date" type="date" value={f.lastDonationDate} onChange={set("lastDonationDate")} error={errors.lastDonationDate} />
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
          <Field label="Village / Area" required placeholder="Enter village or area" value={f.area} onChange={set("area")} error={errors.area} />
          <Select label="Division" required options={DIVISION_NAMES} placeholder="Select division" value={f.division} onChange={setDivision} error={errors.division} />
          <Select label="District" required options={districtsOf(f.division)} placeholder="Select district" value={f.district} onChange={set("district")} error={errors.district} />
          <Select label="Upazila" required options={upazilas} placeholder="Select upazila" value={f.upazila} onChange={set("upazila")} error={errors.upazila} />
        </div>
        <Select label="Blood Group" required options={bloodGroups} placeholder="Choose blood group" value={f.bloodGroup} onChange={set("bloodGroup")} error={errors.bloodGroup} />
        <div>
          <label className="flex items-start gap-2.5 text-sm text-ink-soft"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-600" checked={f.terms} onChange={set("terms")} />I agree to the Terms &amp; Conditions and Privacy Policy.</label>
          {errors.terms && <span className="mt-1 block text-xs text-brand-600">{errors.terms}</span>}
        </div>
        {error && <p role="alert" className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={busy}><Droplet className="h-5 w-5 fill-white" />{busy ? "অপেক্ষা করুন…" : "Register as Donor"}</Button>
        <p className="text-center text-sm text-ink-soft">Already have an account? <Link href="/login" className="font-semibold text-brand-600 hover:underline">Login</Link></p>
      </form>
    </AuthShell>
  );
}
