import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { toPublicDonor } from "@/lib/serializers";
import Favorite from "@/models/Favorite";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const me = await requireAuth(req);
  await connectDB();

  const favs = await Favorite.find({ user: me._id }).sort({ createdAt: -1 }).limit(100).lean();
  const users = await User.find({ _id: { $in: favs.map((f) => f.donor) }, role: "user", status: "Active" }).lean();
  const byId = new Map(users.map((u) => [String(u._id), u]));

  const items = favs
    .map((f) => byId.get(String(f.donor)))
    .filter(Boolean)
    .map((u) => toPublicDonor(u, { authed: true, isFavorite: true }));
  return ok({ items }, "Favorites fetched");
});
