import { z } from "zod";
import { AD_TONES, BLOOD_GROUPS, POST_STATUSES, REPORT_STATUSES, REQUEST_STATUSES, USER_STATUSES } from "@/lib/constants";
import { bloodGroupFilter, emptyToUndef } from "@/lib/validators/common";
import { passwordSchema, phoneSchema, text } from "@/lib/validators/auth";
import { yesNo } from "@/lib/validators/donation";

const pageNum = (name, max, def) =>
  emptyToUndef(z.coerce.number({ invalid_type_error: `${name} must be a number` }).int().min(1).max(max)).transform((v) => v ?? def);
const listBase = { q: emptyToUndef(z.string().trim().max(80)), page: pageNum("page", 100000, 1), limit: pageNum("limit", 50, 10) };
const oneOf = (values, label) => z.enum(values, { errorMap: () => ({ message: `Invalid ${label}` }) });

// ---- ?query ----
export const adminDonorsQuery = z.object({ ...listBase, bloodGroup: bloodGroupFilter, status: emptyToUndef(oneOf(USER_STATUSES, "status")) });
export const adminRequestsQuery = z.object({ ...listBase, bloodGroup: bloodGroupFilter, status: emptyToUndef(oneOf(REQUEST_STATUSES, "status")) });
export const adminPostsQuery = z.object({ ...listBase, status: emptyToUndef(oneOf(POST_STATUSES, "status")) });
export const adminReportsQuery = z.object({ page: listBase.page, limit: listBase.limit, status: emptyToUndef(oneOf(REPORT_STATUSES, "status")) });

// ---- Donors ----
const optionalDate = z
  .string()
  .optional()
  .transform((v) => v?.trim() || null)
  .refine((v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v))), "Enter a valid date");
const donorFields = {
  name: text("Full name", 2, 80),
  phone: phoneSchema,
  bloodGroup: z.enum(BLOOD_GROUPS, { errorMap: () => ({ message: "Choose a valid blood group" }) }),
  status: oneOf(USER_STATUSES, "status"),
  division: text("Division"),
  district: text("District"),
  upazila: text("Upazila"),
  area: z.string().trim().max(120).optional().default(""),
  donationCount: z.coerce.number({ invalid_type_error: "Donations must be a number" }).int().min(0).max(1000),
  lastDonationDate: optionalDate,
  nidVerified: yesNo, // Top Donor স্কোরে +30 (NID ও Phone দুটোই হলে)
  phoneVerified: yesNo,
};
export const adminDonorCreate = z.object({
  ...donorFields,
  status: donorFields.status.default("Active"),
  donationCount: donorFields.donationCount.default(0),
  nidVerified: donorFields.nidVerified.optional(),
  phoneVerified: donorFields.phoneVerified.optional(),
  password: passwordSchema,
});
export const adminDonorUpdate = z
  .object({ ...donorFields, password: z.preprocess((v) => (v === "" ? undefined : v), passwordSchema.optional()) })
  .partial()
  .refine((d) => Object.keys(d).length > 0, "Provide at least one field to update");

// ---- Requests / Posts / Reports ----
export const adminStatusUpdate = (values) => z.object({ status: oneOf(values, "status") });
export const adminRequestStatus = adminStatusUpdate(REQUEST_STATUSES);
export const adminPostStatus = adminStatusUpdate(POST_STATUSES);
export const adminReportAction = z.object({ action: oneOf(["dismiss", "warn", "remove"], "action") });

// ---- Ads ----
const adDate = z
  .string()
  .optional()
  .transform((v) => v?.trim() || null)
  .refine((v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v))), "Enter a valid date");
const httpUrl = z
  .string({ required_error: "Link URL is required" })
  .trim()
  .min(1, "Link URL is required")
  .max(500)
  .refine((v) => {
    try {
      return ["http:", "https:"].includes(new URL(v).protocol);
    } catch {
      return false;
    }
  }, "Enter a valid link starting with http:// or https://");
const adFields = {
  title: text("Ad title", 2, 80),
  text: z.string().trim().max(200, "Description must be at most 200 characters").optional().default(""),
  cta: z.string().trim().max(30, "Button text must be at most 30 characters").optional().default("Learn More"),
  link: httpUrl,
  every: z.coerce.number().int().min(5, "Show every must be 5 to 7").max(7, "Show every must be 5 to 7").default(6),
  tone: oneOf(Object.keys(AD_TONES), "color").default("brand"),
  active: z.boolean({ invalid_type_error: "active must be true or false" }).default(true),
  start: adDate,
  end: adDate,
};
const adDatesOk = (d) => !d.start || !d.end || d.end >= d.start;
const adDatesMsg = { path: ["end"], message: "End date must be after start date" };
export const adCreate = z.object(adFields).refine(adDatesOk, adDatesMsg);
export const adUpdate = z
  .object(adFields)
  .partial()
  .refine((d) => Object.keys(d).length > 0, "Provide at least one field to update")
  .refine(adDatesOk, adDatesMsg);

// ---- Settings / account ----
export const settingsSchema = z.object({
  siteName: text("Website name", 2, 80),
  supportEmail: z.string().trim().email("Enter a valid email").max(120),
  supportPhone: z.string().trim().max(30).optional().default(""),
  siteUrl: z.string().trim().max(120).optional().default(""),
});
export const adminAccountSchema = z
  .object({
    name: text("Name", 2, 80).optional(),
    email: z.string().trim().toLowerCase().email("Enter a valid email").max(120).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.preprocess((v) => (v === "" ? undefined : v), passwordSchema.optional()),
    confirmPassword: z.string().optional(),
  })
  .refine((d) => !d.newPassword || d.currentPassword, { path: ["currentPassword"], message: "Enter your current password to set a new one" })
  .refine((d) => !d.newPassword || d.newPassword === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

// ---- Ad tracking (public) ----
export const adTrackSchema = z.object({ type: z.enum(["impression", "click"], { errorMap: () => ({ message: "Invalid type" }) }) });
