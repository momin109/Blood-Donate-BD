import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";

const tones = { brand: "bg-brand-50 text-brand-600", green: "bg-green-50 text-green-600", amber: "bg-amber-50 text-amber-600", blue: "bg-blue-50 text-blue-600" };

export default function StatCard({ icon: Icon, label, value, delta, tone = "brand" }) {
  const up = delta >= 0;
  return (
    <Card className="min-w-0 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl sm:h-12 sm:w-12", tones[tone])}><Icon className="h-5 w-5 sm:h-6 sm:w-6" /></span>
        {delta !== undefined && (
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", up ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-3 truncate text-2xl font-extrabold tracking-tight sm:text-3xl">{value}</p>
      <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">{label}</p>
    </Card>
  );
}
