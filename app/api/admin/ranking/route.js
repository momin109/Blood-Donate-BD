import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { recomputeRanking } from "@/lib/ranking";
import User from "@/models/User";

export const dynamic = "force-dynamic";

async function topList() {
  const users = await User.find({ role: "user", donorRank: { $gt: 0 } }).sort({ donorRank: 1 }).limit(20).lean();
  return users.map((u) => ({
    id: String(u._id),
    rank: u.donorRank,
    badge: u.badgeType || "none",
    name: u.name,
    donorId: u.donorId || "",
    donations: u.rankDonations ?? 0,
    avgRating: u.avgRating ?? 0,
    score: u.donorScore ?? 0,
    nidVerified: !!u.nidVerified,
    phoneVerified: !!u.phoneVerified,
  }));
}

// বর্তমান Top 20
export const GET = withApi(async (req) => {
  await requireAdmin(req);
  await connectDB();
  return ok({ items: await topList() }, "Ranking fetched");
});

// এখনই নতুন করে হিসাব ("Recalculate" বাটন)
export const POST = withApi(async (req) => {
  await requireAdmin(req);
  await connectDB();
  const result = await recomputeRanking();
  return ok({ ...result, items: await topList() }, "Ranking updated");
});
