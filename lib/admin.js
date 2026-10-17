import BloodRequest from "@/models/BloodRequest";
import Comment from "@/models/Comment";
import Favorite from "@/models/Favorite";
import Image from "@/models/Image";
import Post from "@/models/Post";
import PostAction from "@/models/PostAction";
import User from "@/models/User";
import { deleteConversations } from "@/lib/chat";
import Donation from "@/models/Donation";
import { deletePosts } from "@/lib/posts";
import ChatReport from "@/models/ChatReport";

// অনুরোধের status → তার feed-পোস্টের status
export const postStatusForRequest = (s) => (s === "Pending" ? "Pending" : s === "Rejected" ? "Rejected" : "Approved");

// অন্য user-এর পোস্টে এই user-এর like/share/comment মুছলে সংখ্যাও কমাতে হয়
async function decrementCounters(userId) {
  const ops = [];
  const comments = await Comment.aggregate([{ $match: { author: userId } }, { $group: { _id: "$post", n: { $sum: 1 } } }]);
  comments.forEach((c) => ops.push({ updateOne: { filter: { _id: c._id }, update: { $inc: { comments: -c.n } } } }));
  const acts = await PostAction.aggregate([{ $match: { user: userId, type: { $in: ["like", "share"] } } }, { $group: { _id: { post: "$post", type: "$type" }, n: { $sum: 1 } } }]);
  acts.forEach((a) => ops.push({ updateOne: { filter: { _id: a._id.post }, update: { $inc: { [a._id.type === "like" ? "likes" : "shares"]: -a.n } } } }));
  if (ops.length) await Post.bulkWrite(ops);
}

// Donor মোছা: তার সব পোস্ট, কমেন্ট, like, অনুরোধ, favorite, chat, ছবি সহ
export async function purgeUser(user) {
  const id = user._id;
  await deletePosts({ author: id });
  await decrementCounters(id);
  await Promise.all([
    Comment.deleteMany({ author: id }),
    PostAction.deleteMany({ user: id }),
    Favorite.deleteMany({ $or: [{ user: id }, { donor: id }] }),
  ]);
  const reqs = await BloodRequest.find({ requester: id }).select("_id").lean();
  if (reqs.length) await deletePosts({ request: { $in: reqs.map((r) => r._id) } });
  await BloodRequest.deleteMany({ requester: id });
  await deleteConversations({ participants: id });
  await Donation.deleteMany({ donor: id });
  await ChatReport.deleteMany({ $or: [{ reporter: id }, { reportedUser: id }] });
  await Image.deleteMany({ owner: id });
  await user.deleteOne();
}

// তারিখ-সীমা: বাংলাদেশ সময় (UTC+6) অনুযায়ী মাসের শুরু
export function monthStart(offset = 0) {
  const now = new Date(Date.now() + 6 * 3600 * 1000);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1) - 6 * 3600 * 1000);
}
export const pct = (cur, prev) => (prev ? Math.round(((cur - prev) / prev) * 1000) / 10 : null);

export const adminDonor = (u) => ({
  id: String(u._id),
  donorId: u.donorId,
  name: u.name,
  phone: u.phone,
  bloodGroup: u.bloodGroup,
  division: u.division,
  district: u.district,
  upazila: u.upazila,
  area: u.area || "",
  photo: u.photo ? `/api/images/${u.photo}` : null,
  status: u.status,
  available: u.available,
  donationCount: u.donationCount ?? 0,
  lastDonationDate: u.lastDonationDate ?? null,
  warnings: u.warnings ?? 0,
  nidVerified: !!u.nidVerified,
  phoneVerified: !!u.phoneVerified,
  donorScore: u.donorScore ?? 0,
  badgeType: u.badgeType || "none",
  createdAt: u.createdAt,
});

// রক্তের অনুরোধের পোস্ট Approve/Reject করলে অনুরোধটির status-ও মেলানো (Fulfilled অপরিবর্তিত থাকে)
export async function syncRequestWithPost(post) {
  if (!post.request) return;
  const r = await BloodRequest.findById(post.request);
  if (!r) return;
  const next = post.status === "Approved" ? (r.status === "Fulfilled" ? "Fulfilled" : "Approved") : post.status;
  if (r.status !== next) {
    r.status = next;
    await r.save();
  }
}
