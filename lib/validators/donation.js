import { z } from "zod";
import { DONATION_STATUSES } from "@/lib/constants";
import { emptyToUndef } from "@/lib/validators/common";
import { text } from "@/lib/validators/auth";

const pageNum = (name, max, def) =>
  emptyToUndef(z.coerce.number({ invalid_type_error: `${name} must be a number` }).int().min(1).max(max)).transform((v) => v ?? def);
const oneOf = (values, label) => z.enum(values, { errorMap: () => ({ message: `Invalid ${label}` }) });

// "Yes"/"No" (admin form) বা true/false → boolean; না দিলে undefined
export const yesNo = z.preprocess(
  (v) => (v === true || v === "Yes" || v === "true" ? true : v === false || v === "No" || v === "false" ? false : v),
  z.boolean({ invalid_type_error: "Choose Yes or No" })
);

// POST /api/donations
export const donationSubmitSchema = z.object({
  hospital: text("Hospital", 2, 150),
  donatedAt: z
    .string({ required_error: "Donation date is required" })
    .trim()
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v)), "Enter a valid date (YYYY-MM-DD)")
    .refine((v) => new Date(v) <= new Date(), "Date cannot be in the future"),
});

// GET /api/leaderboard?limit=
export const leaderboardQuery = z.object({ limit: pageNum("limit", 50, 10) });

// ---- Admin ----
export const adminDonationsQuery = z.object({
  q: emptyToUndef(z.string().trim().max(80)),
  status: emptyToUndef(oneOf(DONATION_STATUSES, "status")),
  page: pageNum("page", 100000, 1),
  limit: pageNum("limit", 50, 10),
});

export const adminDonationReview = z.object({
  action: oneOf(["approve", "reject"], "action"),
  respondedWithinHour: yesNo.optional(),
  callReceived: yesNo.optional(),
  // ফাঁকা / "—" = rating নেই
  rating: z.preprocess((v) => (v === "" || v === "—" || v === undefined ? null : v), z.coerce.number({ invalid_type_error: "Rating must be 1 to 5" }).int().min(1, "Rating must be 1 to 5").max(5, "Rating must be 1 to 5").nullable()),
  note: z.string().trim().max(300, "Note must be at most 300 characters").optional(),
});
