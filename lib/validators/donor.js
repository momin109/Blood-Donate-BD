import { z } from "zod";
import { BLOOD_GROUPS } from "@/lib/constants";
import { bloodGroupFilter, emptyToUndef } from "@/lib/validators/common";
import { text } from "@/lib/validators/auth";

// GET /api/donors?bloodGroup=&division=&district=&upazila=&available=&q=&page=&limit=
export const donorQuerySchema = z.object({
  bloodGroup: bloodGroupFilter,
  division: emptyToUndef(z.string().trim().max(60)),
  district: emptyToUndef(z.string().trim().max(60)),
  upazila: emptyToUndef(z.string().trim().max(60)),
  available: emptyToUndef(
    z.enum(["true", "false"], { errorMap: () => ({ message: "available must be true or false" }) }).transform((v) => v === "true")
  ),
  q: emptyToUndef(z.string().trim().max(80)),
  page: emptyToUndef(z.coerce.number({ invalid_type_error: "page must be a number" }).int().min(1)).transform((v) => v ?? 1),
  limit: emptyToUndef(z.coerce.number({ invalid_type_error: "limit must be a number" }).int().min(1).max(50)).transform((v) => v ?? 12),
});

const donationDate = z
  .preprocess((v) => (v === "" ? null : v), z.string().trim().nullable())
  .refine((v) => v === null || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v))), "Enter a valid date (YYYY-MM-DD)")
  .refine((v) => v === null || new Date(v) <= new Date(), "Date cannot be in the future");

// PATCH /api/donors/me — শুধু এই field গুলো বদলানো যায় (phone/role/status নয়)
export const profileUpdateSchema = z
  .object({
    name: text("Full name", 2, 80),
    bloodGroup: z.enum(BLOOD_GROUPS, { errorMap: () => ({ message: "Choose a valid blood group" }) }),
    division: text("Division"),
    district: text("District"),
    upazila: text("Upazila"),
    area: text("Village / Area", 2, 120),
    lastDonationDate: donationDate,
    available: z.boolean({ invalid_type_error: "available must be true or false" }),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, "Provide at least one field to update");
