// Admin panel-এর (ইংরেজি) তারিখ/সময়, বাংলাদেশ সময়ে
const TZ = "Asia/Dhaka";
const d = (v) => (v && !isNaN(new Date(v)) ? new Date(v) : null);
export const dDate = (v) => d(v)?.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TZ }) ?? "—";
export const dDateTime = (v) => d(v)?.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: TZ }) ?? "—";
export function ago(v) {
  const x = d(v);
  if (!x) return "";
  const m = Math.floor((Date.now() - x.getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  if (m < 43200) return `${Math.floor(m / 1440)}d ago`;
  return dDate(x);
}
