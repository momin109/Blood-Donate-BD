"use client";
import Link from "next/link";
import { IdCard, Menu, X, Pencil } from "lucide-react";

// Edit Profile + ID Card + Menu (toggle) বাটন এক সারিতে
export default function ProfileActions({ menuOpen, onMenuToggle, onEdit }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        className="flex h-11 w-full items-center justify-start gap-3 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-ink-soft transition hover:bg-surface"
      >
        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        {menuOpen ? "Close Menu" : "Menu"}
      </button>
    </div>
  );
}
