import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { parseId } from "@/lib/validators/common";
import { adUpdate } from "@/lib/validators/admin";
import Ad from "@/models/Ad";

export const dynamic = "force-dynamic";

// বদলানো / Active-Paused করা
export const PATCH = withApi(async (req, { params }) => {
  await requireAdmin(req);
  const id = parseId(params.id, "ad id");
  const { start, end, ...rest } = await parseBody(req, adUpdate);
  await connectDB();
  const ad = await Ad.findById(id);
  if (!ad) throw new ApiError(404, "Ad not found");
  ad.set(rest);
  if (start !== undefined) ad.start = start ? new Date(start) : undefined;
  if (end !== undefined) ad.end = end ? new Date(end) : undefined;
  if (ad.start && ad.end && ad.end < ad.start) {
    throw new ApiError(400, "Validation failed", [{ field: "end", message: "End date must be after start date" }]);
  }
  await ad.save();
  return ok({ ad }, "Ad updated");
});

export const DELETE = withApi(async (req, { params }) => {
  await requireAdmin(req);
  const id = parseId(params.id, "ad id");
  await connectDB();
  if (!(await Ad.findByIdAndDelete(id))) throw new ApiError(404, "Ad not found");
  return ok(null, "Ad deleted");
});
