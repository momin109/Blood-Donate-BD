import { z } from "zod";
import { BLOOD_GROUPS } from "@/lib/constants";

// এই schema backend ও frontend (React Hook Form + Zod) দুই জায়গাতেই ব্যবহার হবে।
export const text = (label, min = 2, max = 60) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .pipe(
      z
        .string()
        .min(min, `${label} must be at least ${min} characters`)
        .max(max, `${label} must be at most ${max} characters`)
    );

export const phoneSchema = z
  .string({ required_error: "Mobile number is required" })
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^(?:\+?88)?01[3-9]\d{8}$/.test(v), "Enter a valid Bangladeshi mobile number")
  .transform((v) => v.replace(/^\+?88/, ""));

const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password must be at most 64 characters")
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), "Password must contain a letter and a number");

const optionalDate = z
  .string()
  .optional()
  .transform((v) => v?.trim() || undefined)
  .refine((v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v))), "Enter a valid date")
  .refine((v) => !v || new Date(v) <= new Date(), "Date cannot be in the future");

export const registerSchema = z
  .object({
    name: text("Full name", 2, 80),
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string({ required_error: "Please confirm your password" }).min(1, "Please confirm your password"),
    lastDonationDate: optionalDate,
    area: text("Village / Area", 2, 120),
    division: text("Division"),
    district: text("District"),
    upazila: text("Upazila"),
    bloodGroup: z.enum(BLOOD_GROUPS, { errorMap: () => ({ message: "Choose a valid blood group" }) }),
    terms: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms & Conditions" }) }),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: "Mobile number or email is required" })
    .trim()
    .min(1, "Mobile number or email is required")
    .transform((v) => (v.includes("@") ? v.toLowerCase() : v.replace(/[\s-]/g, "").replace(/^\+?88/, ""))),
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});
