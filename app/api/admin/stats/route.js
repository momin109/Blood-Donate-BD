import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { monthStart, pct } from "@/lib/admin";
import { serializeRequests } from "@/lib/requests";
import BloodRequest from "@/models/BloodRequest";
import ChatReport from "@/models/ChatReport";
import Donation from "@/models/Donation";
import Post from "@/models/Post";
import PostAction from "@/models/PostAction";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// Dashboard-এর সংখ্যা, সাম্প্রতিক অনুরোধ ও activity
export const GET = withApi(async (req) => {
  const me = await requireAdmin(req);
  await connectDB();
  const thisM = monthStart(0);
  const lastM = monthStart(-1);
  const inMonth = (extra = {}) => ({ createdAt: { $gte: thisM }, ...extra });
  const inLast = (extra = {}) => ({ createdAt: { $gte: lastM, $lt: thisM }, ...extra });
  const donors = { role: "user" };

  const [totalDonors, donorsNew, donorsPrev, activeRequests, reqNew, reqPrev, totalPosts, postsNew, postsPrev, donatedThisMonth, pendingRequests, openReports, recent, lastUsers, lastReqs, lastPosts, lastReports, openChatReports, pendingDonations] = await Promise.all([
    User.countDocuments(donors),
    User.countDocuments({ ...donors, ...inMonth() }),
    User.countDocuments({ ...donors, ...inLast() }),
    BloodRequest.countDocuments({ status: { $in: ["Pending", "Approved"] } }),
    BloodRequest.countDocuments(inMonth()),
    BloodRequest.countDocuments(inLast()),
    Post.countDocuments(),
    Post.countDocuments(inMonth()),
    Post.countDocuments(inLast()),
    User.countDocuments({ ...donors, lastDonationDate: { $gte: thisM } }),
    BloodRequest.countDocuments({ status: "Pending" }),
    PostAction.countDocuments({ type: "report", status: "Open" }),
    BloodRequest.find().sort({ createdAt: -1 }).limit(5).lean(),
    User.find(donors).sort({ createdAt: -1 }).limit(3).select("name createdAt").lean(),
    BloodRequest.find().sort({ createdAt: -1 }).limit(3).select("patientName bloodGroup bags status createdAt").lean(),
    Post.find({ kind: { $ne: "request" } }).sort({ createdAt: -1 }).limit(2).populate("author", "name").select("text author createdAt").lean(),
    PostAction.find({ type: "report" }).sort({ createdAt: -1 }).limit(2).select("reason createdAt").lean(),
    ChatReport.countDocuments({ status: "Open" }),
    Donation.countDocuments({ status: "Pending" }),
  ]);

  const activity = [
    ...lastUsers.map((u) => ({ title: "New donor registered", detail: `${u.name} joined as a donor`, at: u.createdAt })),
    ...lastReqs.map((r) => ({ title: "Blood request", detail: `${r.patientName} needs ${r.bags} bag(s) of ${r.bloodGroup} (${r.status})`, at: r.createdAt })),
    ...lastPosts.map((p) => ({ title: "New post", detail: `${p.author?.name || "A user"}: ${(p.text || "Photo post").slice(0, 60)}`, at: p.createdAt })),
    ...lastReports.map((r) => ({ title: "Post reported", detail: r.reason, at: r.createdAt })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 6);

  return ok({
    admin: me,
    totals: {
      donors: totalDonors, donorsDelta: pct(donorsNew, donorsPrev),
      activeRequests, requestsDelta: pct(reqNew, reqPrev),
      posts: totalPosts, postsDelta: pct(postsNew, postsPrev),
      donatedThisMonth,
    },
    badges: { pendingRequests, openReports, openChatReports, pendingDonations },
    recentRequests: await serializeRequests(recent, me),
    activity,
  }, "Stats fetched");
});
