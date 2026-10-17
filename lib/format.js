// বাংলা তারিখ/সময় formatter (সব সময় Asia/Dhaka ধরা হয়)
const LOCALE = "bn-BD";
const TZ = "Asia/Dhaka";
const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
};

export const formatDate = (v) =>
  toDate(v)?.toLocaleDateString(LOCALE, { day: "numeric", month: "long", year: "numeric", timeZone: TZ }) ?? "—";

export const formatDateTime = (v) =>
  toDate(v)?.toLocaleString(LOCALE, { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: TZ }) ?? "—";

export const formatMonthYear = (v) =>
  toDate(v)?.toLocaleDateString(LOCALE, { month: "long", year: "numeric", timeZone: TZ }) ?? "—";

export const toDateInput = (v) => (toDate(v) ? new Date(v).toISOString().slice(0, 10) : "");

export function timeAgo(v) {
  const d = toDate(v);
  if (!d) return "";
  const n = (x) => x.toLocaleString(LOCALE);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "এইমাত্র";
  if (mins < 60) return `${n(mins)} মিনিট আগে`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${n(hrs)} ঘণ্টা আগে`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${n(days)} দিন আগে`;
  return formatDate(d);
}

// Chat: আজকের মেসেজে শুধু সময় ("১০:২৪"), আগের হলে তারিখ ("৫ অক্টো")
export function chatTime(v) {
  const d = toDate(v);
  if (!d) return "";
  const day = (x) => x.toLocaleDateString("en-CA", { timeZone: TZ });
  if (day(d) === day(new Date())) return d.toLocaleTimeString(LOCALE, { hour: "numeric", minute: "2-digit", timeZone: TZ });
  return d.toLocaleDateString(LOCALE, { day: "numeric", month: "short", timeZone: TZ });
}

// বাংলা সংখ্যা ("৩২০০") — Leaderboard, স্কোর ইত্যাদির জন্য
export const formatNumber = (n) => Number(n ?? 0).toLocaleString(LOCALE, { useGrouping: false }); // "৩২০০" (কমা ছাড়া, design অনুযায়ী)
