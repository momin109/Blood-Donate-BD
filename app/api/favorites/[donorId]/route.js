import { connectDB } from "@/lib/db";
import { ApiError, ok, withApi } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { parseId } from "@/lib/validators/common";
import Favorite from "@/models/Favorite";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// PUT = favorite করা (idempotent), DELETE = favorite সরানো
export const PUT = withApi(async (req, { params }) => {
  const me = await requireAuth(req);
  const donorId = parseId(params.donorId, "donor id");
  if (String(me._id) === donorId) throw new ApiError(400, "You cannot add yourself to favorites");
  await connectDB();

  if (!(await User.exists({ _id: donorId, role: "user", status: "Active" }))) throw new ApiError(404, "Donor not found");
  await Favorite.updateOne({ user: me._id, donor: donorId }, { $setOnInsert: { user: me._id, donor: donorId } }, { upsert: true });
  return ok({ isFavorite: true }, "Added to favorites");
});

export const DELETE = withApi(async (req, { params }) => {
  const me = await requireAuth(req);
  const donorId = parseId(params.donorId, "donor id");
  await connectDB();

  await Favorite.deleteOne({ user: me._id, donor: donorId });
  return ok({ isFavorite: false }, "Removed from favorites");
});
