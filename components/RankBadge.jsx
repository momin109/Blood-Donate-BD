import { Crown, Droplet, Medal } from "lucide-react";
import { BADGES, gradientOf } from "@/lib/badges";
import { cn } from "@/lib/cn";

// Top Donor badge। size: "xs" = ছোট crown গোল (donor card-এর কোণায়), "sm" = ছোট pill, "lg" = প্রোফাইলের বড় badge
export default function RankBadge({ badge, size = "sm", className }) {
  const b = BADGES[badge];
  if (!b) return null;
  const style = { background: gradientOf(badge), color: b.ink };
  const champion = badge !== "top10";

  if (size === "xs") {
    return (
      <span title={b.title} aria-label={b.title} style={style} className={cn("flex h-7 w-7 items-center justify-center rounded-full shadow-md ring-2 ring-white", className)}>
        {champion ? <Crown className="h-4 w-4" fill="currentColor" /> : <Medal className="h-4 w-4" />}
      </span>
    );
  }
  if (size === "lg") {
    return (
      <span style={style} className={cn("inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold shadow-md sm:text-base", className)}>
        {champion && <Crown className="h-5 w-5 shrink-0" fill="currentColor" />}
        <Droplet className="h-4 w-4 shrink-0 fill-red-600 text-red-600" />
        <span className="min-w-0 break-words">{b.title}</span>
        <Medal className="h-5 w-5 shrink-0" />
      </span>
    );
  }
  return (
    <span style={style} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold", className)}>
      {champion ? <Crown className="h-3.5 w-3.5" fill="currentColor" /> : <Medal className="h-3.5 w-3.5" />}
      {b.short}
    </span>
  );
}
