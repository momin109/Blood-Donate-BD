"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Droplet,
  FileText,
  Flag,
  Megaphone,
  NotebookIcon,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/cn";

const nav = [
  ["Overview", [["/admin", "Dashboard", LayoutDashboard]]],
  [
    "Management",
    [
      ["/admin/donors", "Donors", Users],
      ["/admin/requests", "Blood Requests", Droplet],
      ["/admin/posts", "Posts", FileText],
      ["/admin/reports", "Reports", Flag],
      ["/admin/ads", "Advertisements", Megaphone],
      ["/admin/notifications", "Notifications", NotebookIcon],
    ],
  ],
  ["System", [["/admin/settings", "Settings", Settings]]],
];
const isActive = (p, h) => (h === "/admin" ? p === "/admin" : p.startsWith(h));

export default function AdminShell({ children }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-surface lg:pl-64">
      {/* Sidebar: fixed on desktop, slide-in drawer on mobile/tablet */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-neutral-950 text-white transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-float">
            <Droplet className="h-5 w-5 fill-white" />
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate font-bold">Blood Donate BD</p>
            <p className="text-xs text-white/50">Admin Panel</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {nav.map(([group, items]) => (
            <div key={group}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                {group}
              </p>
              <ul className="space-y-1">
                {items.map(([h, l, Icon, n]) => (
                  <li key={h}>
                    <Link
                      href={h}
                      className={cn(
                        "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                        isActive(path, h)
                          ? "bg-brand-600 text-white shadow-float"
                          : "text-white/70 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="flex-1 truncate">{l}</span>
                      {n && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-bold",
                            isActive(path, h)
                              ? "bg-white/20"
                              : "bg-brand-600 text-white",
                          )}
                        >
                          {n}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3">
          <Link
            href="/"
            className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm text-white/70 hover:bg-white/10"
          >
            <ExternalLink className="h-[18px] w-[18px]" />
            View Website
          </Link>
          <Link
            href="/admin/login"
            className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm text-white/70 hover:bg-white/10"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </Link>
        </div>
      </aside>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gray-100 bg-white/90 px-4 backdrop-blur sm:px-6">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-ink hover:bg-gray-200 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden max-w-sm flex-1 sm:block">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className="h-10 w-full rounded-full bg-surface pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-200"
            placeholder="Search donors, requests, posts..."
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink-soft hover:bg-gray-200"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-brand-600 ring-2 ring-white" />
          </button>
          <Link
            href="/admin/settings"
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 hover:bg-surface sm:pr-3"
          >
            <Avatar name="Admin" size="sm" />
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-semibold">Admin</span>
              <span className="block text-[11px] text-ink-soft">
                Super Admin
              </span>
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full min-w-0 max-w-7xl p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
