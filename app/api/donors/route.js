import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { pagination, parseQuery, escapeRegex } from "@/lib/query";
import { toPublicDonor } from "@/lib/serializers";
import { donorQuerySchema } from "@/lib/validators/donor";
import Favorite from "@/models/Favorite";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const { bloodGroup, division, district, upazila, available, q, page, limit } = parseQuery(req, donorQuerySchema);
  await connectDB();
  const me = await getAuthUser(req);

  const filter = { role: "user", status: "Active", donorId: { $exists: true } };
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (division) filter.division = division;
  if (district) filter.district = district;
  if (upazila) filter.upazila = upazila;
  if (available !== undefined) filter.available = available;
  if (q) filter.name = { $regex: escapeRegex(q), $options: "i" };

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .sort({ available: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  let favSet = null;
  if (me) {
    const favs = await Favorite.find({ user: me._id, donor: { $in: users.map((u) => u._id) } }).lean();
    favSet = new Set(favs.map((f) => String(f.donor)));
  }

  const items = users.map((u) => toPublicDonor(u, { authed: !!me, isFavorite: favSet ? favSet.has(String(u._id)) : undefined }));
  return ok({ items, pagination: pagination(page, limit, total) }, "Donors fetched");
});
