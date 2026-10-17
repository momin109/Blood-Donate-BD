import { z } from "zod";
import { text } from "@/lib/validators/auth";

// এই schema backend (API) ও frontend (Admin form) — দুই জায়গাতেই ব্যবহার হয়।
// (@/lib/api না আনা হয়েছে যাতে browser bundle-এ server-only কিছু না ঢোকে)
const id = (label) => z.string({ required_error: `${label} is required` }).regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);
const blankToUndef = (schema) => z.preprocess((v) => (v === "" || v == null ? undefined : v), schema.optional());

export const MAX_RECIPIENTS = 200;
export const TITLE_MAX = 80;
export const MESSAGE_MAX = 500;

// ক্লিকে খোলার লিংক: নিজের site-এর path ("/requests") অথবা http(s) লিংক। javascript: ইত্যাদি বন্ধ।
export function isSafeTarget(v) {
  if (v.startsWith("/")) return !v.startsWith("//") && !v.includes("\\");
  try {
    return ["http:", "https:"].includes(new URL(v).protocol);
  } catch {
    return false;
  }
}

export const notificationCreate = z
  .object({
    title: text("Title", 2, TITLE_MAX),
    message: text("Message", 2, MESSAGE_MAX),
    url: z
      .string()
      .trim()
      .max(500, "Link must be at most 500 characters")
      .optional()
      .default("")
      .refine((v) => !v || isSafeTarget(v), "Enter a page like /requests or a full link starting with https://"),
    imageId: blankToUndef(id("image")),
    audience: z.enum(["all", "selected"], { errorMap: () => ({ message: "Choose who to send to" }) }).default("all"),
    recipients: z
      .array(id("user"))
      .max(MAX_RECIPIENTS, `You can select up to ${MAX_RECIPIENTS} users`)
      .default([])
      .transform((a) => [...new Set(a)]),
  })
  .superRefine((d, ctx) => {
    if (d.audience === "selected" && !d.recipients.length) {
      ctx.addIssue({ code: "custom", path: ["recipients"], message: "Select at least one user" });
    }
  });

// ---- user-side ----
export const notificationsQuery = z.object({
  limit: blankToUndef(z.coerce.number({ invalid_type_error: "limit must be a number" }).int().min(1).max(50)).transform((v) => v ?? 20),
  before: blankToUndef(z.coerce.date({ invalid_type_error: "Invalid date" })), // এর আগের notification (load more)
});

// ---- admin list ----
const pageNum = (max, def) => blankToUndef(z.coerce.number().int().min(1).max(max)).transform((v) => v ?? def);
export const adminNotificationsQuery = z.object({ page: pageNum(100000, 1), limit: pageNum(50, 10) });

// ---- Push subscription ----
export const pushSubscriptionSchema = z.object({
  endpoint: z
    .string({ required_error: "endpoint is required" })
    .url("Invalid endpoint")
    .max(1000)
    .refine((v) => v.startsWith("https://"), "Push endpoint must be https"),
  keys: z.object({
    p256dh: z.string().min(1, "p256dh is required").max(200),
    auth: z.string().min(1, "auth is required").max(100),
  }),
});
export const pushUnsubscribeSchema = z.object({ endpoint: z.string().min(1).max(1000) });
