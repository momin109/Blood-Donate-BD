import Link from "next/link";
import { Logo } from "@/components/ui";
export default function AuthShell({ title, sub, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface p-4">
      <div className="absolute inset-x-0 top-0 h-72 rounded-b-[3rem] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-6 flex justify-center rounded-3xl bg-white/95 px-5 py-3 shadow-card"><Logo /></Link>
        <div className="rounded-[2rem] bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mb-6 mt-1 text-ink-soft">{sub}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
