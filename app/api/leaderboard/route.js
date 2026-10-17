import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { parseQuery } from "@/lib/query";
import { imageUrl } from "@/lib/serializers";
import { leaderboardQuery } from "@/lib/validators/donation";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// Top Donor leaderboard (সবার জন্য খোলা): ?limit=10  — র‍্যাংক ১ থেকে। লগইন থাকলে "me" (নিজের অবস্থান) সহ
export const GET = withApi(async (req) => {
  const { limit } = parseQuery(req, leaderboardQuery);
  await connectDB();
  const me = await getAuthUser(req);
  const users = await User.find({ role: "user", status: "Active", donorRank: { $gt: 0, $lte: limit } })
    .sort({ donorRank: 1 })
    .limit(limit)
    .lean();
  const items = users.map((u) => ({
    id: String(u._id),
    rank: u.donorRank,
    badge: u.badgeType || "none",
    name: u.name,
    photo: imageUrl(u.photo),
    bloodGroup: u.bloodGroup,
    district: u.district,
    donations: u.rankDonations ?? 0,
    score: u.donorScore ?? 0,
    avgRating: u.avgRating ?? 0,
    verified: !!(u.nidVerified && u.phoneVerified),
  }));
  const mine = me && me.donorRank > 0 ? { rank: me.donorRank, badge: me.badgeType, score: me.donorScore, donations: me.rankDonations } : null;
  return ok({ items, me: mine }, "Leaderboard fetched");
});
