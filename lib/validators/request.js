import { z } from "zod";
import { BLOOD_GROUPS, REQUEST_REASONS, REQUEST_STATUSES, URGENCIES } from "@/lib/constants";
import { bloodGroupFilter, emptyToUndef } from "@/lib/validators/common";
import { phoneSchema, text } from "@/lib/validators/auth";

const num = (label, { min, max, int = false }) => {
  let n = z.coerce.number({ invalid_type_error: `${label} must be a number`, required_error: `${label} is required` });
  if (int) n = n.int(`${label} must be a whole number`);
  return n.min(min, `${label} must be at least ${min}`).max(max, `${label} must be at most ${max}`);
};

// datetime-local ("2026-10-20T10:00") এ timezone থাকে না — বাংলাদেশ সময় (UTC+6) ধরা হয়
const neededAt = z
  .string({ required_error: "Date and time is required" })
  .trim()
  .min(1, "Date and time is required")
  .transform((v) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) v += "T00:00";
    return /([zZ]|[+-]\d{2}:?\d{2})$/.test(v) ? v : `${v}+06:00`;
  })
  .transform((v) => new Date(v))
  .refine((d) => !isNaN(d), "Enter a valid date and time")
  .refine((d) => isNaN(d) || d.getTime() >= Date.now() - 5 * 60 * 1000, "Date and time cannot be in the past");

// POST /api/requests (সব field Bangla form-এর সাথে মেলানো)
export const requestCreateSchema = z.object({
  patientName: text("Patient name", 2, 80),
  age: num("Age", { min: 0, max: 120, int: true }),
  bloodGroup: z.enum(BLOOD_GROUPS, { errorMap: () => ({ message: "Choose a valid blood group" }) }),
  bags: num("Bags", { min: 1, max: 10, int: true }),
  hemoglobin: emptyToUndef(num("Hemoglobin", { min: 1, max: 25 })),
  hospital: text("Hospital name", 2, 150),
  division: text("Division"),
  district: text("District"),
  upazila: text("Upazila"),
  contactPhone: phoneSchema,
  urgency: z.enum(URGENCIES, { errorMap: () => ({ message: "Choose a valid urgency level" }) }).default("Urgent"),
  neededAt,
  reason: z.enum(REQUEST_REASONS, { errorMap: () => ({ message: "Choose a valid reason" }) }),
  details: emptyToUndef(z.string().trim().max(1000, "Details must be at most 1000 characters")),
});

// GET /api/requests?bloodGroup=&division=&district=&upazila=&urgency=&status=&mine=&page=&limit=
export const requestQuerySchema = z.object({
  bloodGroup: bloodGroupFilter,
  division: emptyToUndef(z.string().trim().max(60)),
  district: emptyToUndef(z.string().trim().max(60)),
  upazila: emptyToUndef(z.string().trim().max(60)),
  urgency: emptyToUndef(z.enum(URGENCIES, { errorMap: () => ({ message: "Invalid urgency" }) })),
  status: emptyToUndef(z.enum(REQUEST_STATUSES, { errorMap: () => ({ message: "Invalid status" }) })),
  mine: emptyToUndef(
    z.enum(["true", "false"], { errorMap: () => ({ message: "mine must be true or false" }) }).transform((v) => v === "true")
  ),
  page: emptyToUndef(z.coerce.number({ invalid_type_error: "page must be a number" }).int().min(1)).transform((v) => v ?? 1),
  limit: emptyToUndef(z.coerce.number({ invalid_type_error: "limit must be a number" }).int().min(1).max(50)).transform((v) => v ?? 10),
});

// PATCH /api/requests/:id — মালিক শুধু "Fulfilled" চিহ্নিত করতে পারে
export const requestStatusSchema = z.object({
  status: z.literal("Fulfilled", { errorMap: () => ({ message: 'You can only set status to "Fulfilled"' }) }),
});
