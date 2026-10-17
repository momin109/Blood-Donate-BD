"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import PasswordField from "@/components/PasswordField";
import { Button, Field } from "@/components/ui";
import { api } from "@/lib/client";

// POST /api/admin/login — শুধু admin অ্যাকাউন্ট ঢুকতে পারে
export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  // আগে থেকেই admin হিসেবে login থাকলে সরাসরি panel-এ
  useEffect(() => {
    api("/api/auth/me").then((d) => d.user.role === "admin" && router.replace("/admin")).catch(() => {});
  }, [router]);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setErrors({});
    try {
      await api("/api/admin/login", { method: "POST", body: { identifier: email, password } });
      router.replace("/admin");
    } catch (err) {
      setError(err.message);
      setErrors(err.fieldErrors || {});
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Admin Login" sub="Sign in to manage Blood Donate BD">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" icon={Mail} type="email" placeholder="admin@blooddonatebd.com" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.identifier} />
        <PasswordField label="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        {error && <p role="alert" className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "অপেক্ষা করুন…" : "Login"}</Button>
      </form>
    </AuthShell>
  );
}
