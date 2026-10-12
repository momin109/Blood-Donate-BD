import { NextResponse } from "next/server";
import { ZodError } from "zod";

// সব API-র response format: { success, message, data } অথবা { success:false, message, errors? }
export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export const ok = (data = null, message = "OK", status = 200) =>
  NextResponse.json({ success: true, message, data }, { status });

export const fail = (status, message, errors) =>
  NextResponse.json({ success: false, message, ...(errors ? { errors } : {}) }, { status });

export function handleError(err) {
  if (err instanceof ApiError) return fail(err.status, err.message, err.errors);
  if (err instanceof ZodError) {
    const errors = err.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
    return fail(400, "Validation failed", errors);
  }
  if (err?.name === "ValidationError" && err.errors) {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return fail(400, "Validation failed", errors);
  }
  if (err?.name === "CastError") return fail(400, "Invalid id");
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return fail(409, `${field} already exists`, [{ field, message: `${field} already exists` }]);
  }
  console.error("[API ERROR]", err);
  return fail(500, "Internal server error");
}

// প্রতিটি route handler এই wrapper দিয়ে মুড়ে দিলে try/catch আলাদা লিখতে হয় না।
export const withApi = (handler) => async (req, ctx) => {
  try {
    return await handler(req, ctx);
  } catch (err) {
    return handleError(err);
  }
};

// JSON body পড়ে Zod schema দিয়ে validate করে। ভুল হলে ApiError/ZodError throw করে।
export async function parseBody(req, schema) {
  let json;
  try {
    json = await req.json();
  } catch {
    throw new ApiError(400, "Invalid or empty JSON body");
  }
  return schema.parse(json);
}
