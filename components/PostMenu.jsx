"use client";
import { useEffect, useRef, useState } from "react";
import { MoreVertical, Bookmark, Flag, Link2, Check } from "lucide-react";
import { cn } from "@/lib/cn";

// Three-dot (⋮) post menu: Save Post / Report Post / Copy Link (UI only)
export default function PostMenu({ postId }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, []);

  const flash = (t) => {
    setNote(t);
    setTimeout(() => setNote(""), 1800);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/#post-${postId}`,
      );
    } catch (e) {}
    flash("Link copied");
    setOpen(false);
  };
  const items = [
    [
      Bookmark,
      saved ? "Saved" : "Save Post",
      () => {
        setSaved(!saved);
        flash(saved ? "Removed from saved" : "Post saved");
        setOpen(false);
      },
      saved && "fill-brand-600 text-brand-600",
    ],
    [
      Flag,
      "Report Post",
      () => {
        flash("Post reported");
        setOpen(false);
      },
    ],
    [Link2, "Copy Link", copy],
  ];
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Post options"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-gray-100"
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-black/5">
          {items.map(([Icon, label, fn, c]) => (
            <button
              key={label}
              onClick={fn}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-surface"
            >
              <Icon className={cn("h-4 w-4 text-ink-soft", c)} />
              {label}
            </button>
          ))}
        </div>
      )}
      {note && (
        <span className="absolute right-0 top-full z-20 mt-1 flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-neutral-900 px-3 py-2 text-xs font-medium text-white shadow-lg">
          <Check className="h-3.5 w-3.5" />
          {note}
        </span>
      )}
    </div>
  );
}
