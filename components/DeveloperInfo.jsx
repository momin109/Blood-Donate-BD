"use client";
import { useState } from "react";
import { Code2, ChevronDown, Mail, Globe } from "lucide-react";
import { Avatar } from "@/components/ui";
import { developer, company } from "@/data";
import { cn } from "@/lib/cn";

// Hidden by default; click the button to show, click again to hide
export default function DeveloperInfo() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex h-14 w-full items-center gap-3 rounded-3xl bg-white px-5 font-semibold shadow-card transition hover:shadow-float/30">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white"><Code2 className="h-5 w-5" /></span>
        Developer Information
        <ChevronDown className={cn("ml-auto h-5 w-5 text-ink-soft transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-3 overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-800 to-neutral-950 p-5 text-white shadow-card sm:p-6">
          <div className="flex items-center gap-4">
            <Avatar name={developer.name} size="lg" />
            <div className="min-w-0"><p className="truncate text-xl font-bold">{developer.name}</p><p className="text-sm text-white/70">{developer.role} · {company.name}</p></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">{developer.stack.map((s) => <span key={s} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">{s}</span>)}</div>
          <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row">
            <a href={`mailto:${developer.email}`} className="flex min-w-0 items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 hover:bg-white/20"><Mail className="h-4 w-4 shrink-0" /><span className="truncate">{developer.email}</span></a>
            <a href={developer.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 hover:bg-white/20"><Globe className="h-4 w-4" />Portfolio</a>
          </div>
        </div>
      )}
    </div>
  );
}
