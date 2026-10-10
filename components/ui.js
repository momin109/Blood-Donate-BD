import { Droplet } from "lucide-react";
import { cn } from "@/lib/cn";

const btn = {
  primary: "bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-float hover:brightness-105 active:scale-[.98]",
  soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
  outline: "border border-gray-200 bg-white text-ink hover:bg-gray-50",
  white: "bg-white text-brand-700 shadow-sm hover:bg-brand-50",
  glass: "border border-white/30 bg-white/10 text-white hover:bg-white/20",
};
const btnSize = { sm: "h-9 px-3.5 text-sm gap-1.5", md: "h-11 px-5 text-sm gap-2", lg: "h-14 px-6 text-base gap-2" };

export function Button({ variant = "primary", size = "md", className, ...p }) {
  return <button className={cn("inline-flex items-center justify-center rounded-2xl font-semibold transition focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 disabled:opacity-50", btn[variant], btnSize[size], className)} {...p} />;
}
export const Card = ({ className, ...p }) => <div className={cn("rounded-3xl bg-white shadow-card", className)} {...p} />;

export function BloodBadge({ group, size = "md", className }) {
  const s = { sm: "h-6 px-2 text-xs gap-1", md: "h-8 px-3 text-sm gap-1.5", lg: "h-14 px-6 text-3xl gap-2" }[size];
  return (
    <span className={cn("inline-flex items-center rounded-full bg-gradient-to-b from-brand-500 to-brand-700 font-bold text-white shadow-sm", s, className)}>
      <Droplet className={cn("fill-white", size === "lg" ? "h-6 w-6" : "h-3 w-3")} />{group}
    </span>
  );
}
const tones = { success: "bg-green-50 text-green-700", warning: "bg-amber-50 text-amber-700", danger: "bg-brand-50 text-brand-700", neutral: "bg-gray-100 text-gray-600" };
export const Status = ({ tone = "neutral", className, ...p }) => <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone], className)} {...p} />;
export const statusTone = { Urgent: "danger", Pending: "warning", Approved: "success", Fulfilled: "neutral" };

const avSizes = { sm: "h-9 w-9 text-sm", md: "h-11 w-11 text-base", lg: "h-14 w-14 text-lg", xl: "h-28 w-28 text-4xl" };
const avColors = ["from-rose-400 to-rose-700", "from-orange-400 to-red-600", "from-pink-400 to-fuchsia-700", "from-red-400 to-red-800"];
export function Avatar({ name = "", size = "md", online, ring, className }) {
  const c = avColors[(name.charCodeAt(0) || 0) % avColors.length];
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span className={cn("inline-flex items-center justify-center rounded-full bg-gradient-to-br font-bold text-white", c, avSizes[size], ring && "ring-[3px] ring-offset-2 " + ring)}>{name.trim().charAt(0)}</span>
      {online !== undefined && <span className={cn("absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white", online ? "bg-green-500" : "bg-gray-300")} />}
    </span>
  );
}

export function Select({ label, options, placeholder, required, ...p }) {
  return (
    <label className="block">
      {label && <span className="label">{label}{required && <span className="text-brand-600"> *</span>}</span>}
      <select className="field appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%239ca3af%22 stroke-width=%222%22 viewBox=%220 0 24 24%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10" defaultValue="" {...p}>
        <option value="" disabled>{placeholder || "নির্বাচন করুন"}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}
export function Field({ label, required, error, icon: Icon, suffix, as: As = "input", ...p }) {
  return (
    <label className="block">
      {label && <span className="label">{label}{required && <span className="text-brand-600"> *</span>}</span>}
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />}
        <As className={cn("field", Icon && "pl-11", suffix && "pr-12", As === "textarea" && "h-auto py-3", error && "border-brand-500 bg-white ring-4 ring-brand-100")} {...p} />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-ink-soft">{suffix}</span>}
      </div>
      {error && typeof error === "string" && <span className="mt-1 block text-xs text-brand-600">{error}</span>}
    </label>
  );
}
export function Switch({ on, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className={cn("relative h-8 w-14 shrink-0 rounded-full transition", on ? "bg-green-500" : "bg-gray-300")}>
      <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all", on ? "left-7" : "left-1")} />
    </button>
  );
}
export const Empty = ({ icon: Icon, title, hint }) => (
  <div className="flex flex-col items-center py-12 text-center">
    <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Icon className="h-6 w-6" /></span>
    <p className="font-semibold">{title}</p><p className="text-sm text-ink-soft">{hint}</p>
  </div>
);
export function Logo({ sub = true }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-float sm:h-11 sm:w-11">
        <Droplet className="h-6 w-6 fill-white" /><span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
      </span>
      <span className="leading-tight"><span className="block text-base font-extrabold tracking-tight sm:text-lg">Blood <span className="text-brand-600">Donate</span> BD</span>
        {sub && <span className="hidden text-[11px] text-ink-soft min-[400px]:block">জরুরি রক্তদান প্ল্যাটফর্ম</span>}</span>
    </span>
  );
}
