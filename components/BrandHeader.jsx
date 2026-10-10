import Link from "next/link";
import { Droplet } from "lucide-react";

// Shared branding for Login & Registration: logo on top, "Blood Donate BD" below
export default function BrandHeader() {
  return (
    <Link href="/" className="flex flex-col items-center text-center text-white">
      <span className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-float sm:h-20 sm:w-20">
        <Droplet className="h-9 w-9 fill-brand-600 text-brand-600 sm:h-11 sm:w-11" />
        <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white" />
      </span>
      <span className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">Blood Donate BD</span>
      <span className="mt-0.5 text-xs text-white/80 sm:text-sm">জরুরি রক্তদান প্ল্যাটফর্ম</span>
    </Link>
  );
}
