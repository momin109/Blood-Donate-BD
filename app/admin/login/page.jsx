import Link from "next/link";
import { Mail } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import PasswordField from "@/components/PasswordField";
import { Button, Field } from "@/components/ui";

export const metadata = { title: "Admin Login · Blood Donate BD" };

export default function AdminLogin() {
  return (
    <AuthShell title="Admin Login" sub="Sign in to manage Blood Donate BD">
      <div className="space-y-4">
        <Field label="Email" icon={Mail} type="email" placeholder="admin@blooddonatebd.com" />
        <PasswordField label="Password" />
        <div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-brand-600" />Remember me</label><Link href="#" className="font-semibold text-brand-600 hover:underline">Forgot Password?</Link></div>
        <Link href="/admin" className="block"><Button size="lg" className="w-full">Login</Button></Link>
      </div>
    </AuthShell>
  );
}
