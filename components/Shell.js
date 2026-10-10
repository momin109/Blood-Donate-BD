"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Plus, MessageCircle, User, Bell, Search, LogIn, Droplet } from "lucide-react";
import { Avatar, Logo } from "@/components/ui";
import { me } from "@/data";
import { cn } from "@/lib/cn";

const nav = [["/", "হোম", Home], ["/donors", "ডোনার", Users], ["/requests", "অনুরোধ", Plus], ["/chat", "চ্যাট", MessageCircle], ["/me", "প্রোফাইল", User]];
const active = (p, h) => (h === "/" ? p === "/" : p.startsWith(h));

export default function Shell({ children }) {
  const path = usePathname();
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link href="/"><Logo /></Link>
          <div className="relative ml-6 hidden max-w-xs flex-1 lg:block">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input className="h-11 w-full rounded-full bg-surface pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-200" placeholder="ডোনার বা পোস্ট খুঁজুন" />
          </div>
          <nav className="mx-auto hidden items-center gap-1 md:flex">
            {nav.map(([h, l, Icon]) => (
              <Link key={h} href={h} className={cn("relative flex h-16 items-center gap-2 px-4 text-sm font-semibold transition", active(path, h) ? "text-brand-600" : "text-ink-soft hover:text-ink")}>
                <Icon className="h-[18px] w-[18px]" />{l}
                {active(path, h) && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-brand-600" />}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Link href="/notifications" className="relative flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink-soft hover:bg-gray-200">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white ring-2 ring-white">3</span>
            </Link>
            <Link href="/me" className="hidden md:block"><Avatar name={me.name} size="sm" /></Link>
            <Link href="/login" className="flex h-11 items-center gap-1.5 rounded-full bg-gradient-to-b from-brand-500 to-brand-700 px-4 text-sm font-semibold text-white shadow-float md:hidden"><LogIn className="h-4 w-4" />লগইন</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-100 bg-white/95 backdrop-blur md:hidden" style={{ paddingBottom: "max(.5rem, env(safe-area-inset-bottom))" }}>
        <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-2">
          {nav.map(([h, l, Icon], i) => {
            const on = active(path, h);
            if (i === 2) return (
              <li key={h} className="flex justify-center">
                <Link href={h} className="-mt-7 flex flex-col items-center gap-1 text-[11px] font-bold text-brand-700">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-float ring-4 ring-white"><Icon className="h-8 w-8" /></span>{l}
                </Link>
              </li>
            );
            return (
              <li key={h}>
                <Link href={h} className={cn("flex flex-col items-center gap-1 pt-2.5 text-[11px] font-semibold", on ? "text-brand-600" : "text-gray-400")}>
                  <Icon className={cn("h-6 w-6", on && "fill-brand-100")} />{l}
                  <span className={cn("h-1 w-1 rounded-full", on ? "bg-brand-600" : "bg-transparent")} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
