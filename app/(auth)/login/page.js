"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import PasswordField from "@/components/PasswordField";
import { Button, Field } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";

// ?next=/requests এর মতো ভিতরের path-এ ফেরত পাঠানো (open redirect ঠেকাতে শুধু "/" দিয়ে শুরু হওয়া path)
const safeNext = () => {
  const n = new URLSearchParams(window.location.search).get("next");
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/";
};

export default function Login() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!loading && user) router.replace(safeNext());
  }, [loading, user, router]);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFieldErrors({});
    try {
      await login(identifier, password);
      router.replace(safeNext());
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
      setBusy(false);
    }
  }

  return (
    <AuthShell title="স্বাগতম" sub="আপনার অ্যাকাউন্টে লগইন করুন">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="মোবাইল নম্বর" icon={Phone} type="tel" placeholder="+880 1XXXX-XXXXXX" autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} error={fieldErrors.identifier} />
        <PasswordField label="পাসওয়ার্ড" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-brand-600" /> Remember me</label>
          <Link href="#" className="font-semibold text-brand-600 hover:underline">Forgot Password?</Link>
        </div>
        {error && <p role="alert" className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "অপেক্ষা করুন…" : "Login"}</Button>
        <p className="text-center text-sm text-ink-soft">অ্যাকাউন্ট নেই? <Link href="/register" className="font-semibold text-brand-600 hover:underline">Register</Link></p>
      </form>
    </AuthShell>
  );
}
