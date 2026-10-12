import { z } from "zod";
import { ApiError } from "@/lib/api";
import { BLOOD_GROUPS } from "@/lib/constants";

export const objectId = (label = "id") =>
  z.string({ required_error: `${label} is required` }).regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

// ফাঁকা string ("") কে undefined ধরে, যাতে ফাঁকা filter-select এ error না হয়
export const emptyToUndef = (schema) =>
  z.preprocess((v) => (v === "" || v == null ? undefined : v), schema.optional());

// URL param-এর id যাচাই; ভুল হলে field: "id" সহ 400
export function parseId(value, label = "id") {
  if (!/^[0-9a-fA-F]{24}$/.test(String(value))) {
    throw new ApiError(400, `Invalid ${label}`, [{ field: "id", message: `Invalid ${label}` }]);
  }
  return String(value);
}

// ?bloodGroup=A+ — URL-এ "+" অনেক সময় space হয়ে আসে, তাই আবার "+" করা হয়
export const bloodGroupFilter = emptyToUndef(
  z
    .string()
    .transform((v) => v.replace(/ /g, "+"))
    .pipe(z.enum(BLOOD_GROUPS, { errorMap: () => ({ message: "Invalid blood group" }) }))
);
