import { connectDB } from "@/lib/db";
import { ApiError, ok, withApi } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { toPublicDonor } from "@/lib/serializers";
import { parseId } from "@/lib/validators/common";
import Favorite from "@/models/Favorite";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export const GET = withApi(async (req, { params }) => {
  const id = parseId(params.id, "donor id");
  await connectDB();
  const me = await getAuthUser(req);

  const donor = await User.findOne({ _id: id, role: "user", status: "Active", donorId: { $exists: true } }).lean();
  if (!donor) throw new ApiError(404, "Donor not found");

  const isFavorite = me ? !!(await Favorite.exists({ user: me._id, donor: donor._id })) : undefined;
  return ok({ donor: toPublicDonor(donor, { authed: !!me, isFavorite }) }, "Donor fetched");
});
