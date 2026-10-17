import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { escapeRegex, pagination, parseQuery } from "@/lib/query";
import { adminPostsQuery } from "@/lib/validators/admin";
import { imageUrl } from "@/lib/serializers";
import Post from "@/models/Post";
import PostAction from "@/models/PostAction";
import User from "@/models/User";

export const dynamic = "force-dynamic";

const TYPE = { donate: "Donation", general: "General", request: "Request" };

// সব পোস্ট: ?status= &q= (লেখা বা লেখকের নাম)। Approved ছাড়া status ফিডে লুকানো থাকে।
export const GET = withApi(async (req) => {
  await requireAdmin(req);
  const { q, status, page, limit } = parseQuery(req, adminPostsQuery);
  await connectDB();
  const filter = {};
  if (status) filter.status = status === "Approved" ? { $nin: ["Pending", "Rejected"] } : status;
  if (q) {
    const re = { $regex: escapeRegex(q), $options: "i" };
    const authors = await User.find({ name: re }).select("_id").limit(200).lean();
    filter.$or = [{ text: re }, { author: { $in: authors.map((a) => a._id) } }];
  }
  const [total, docs] = await Promise.all([
    Post.countDocuments(filter),
    Post.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("author", "name photo donorId").lean(),
  ]);
  const counts = await PostAction.aggregate([{ $match: { type: "report", post: { $in: docs.map((d) => d._id) } } }, { $group: { _id: "$post", n: { $sum: 1 } } }]);
  const reports = new Map(counts.map((c) => [String(c._id), c.n]));

  const items = docs.map((d) => ({
    id: String(d._id),
    author: d.author ? { id: String(d.author._id), name: d.author.name, photo: imageUrl(d.author.photo), donorId: d.author.donorId } : null,
    text: d.text || "",
    images: (d.images || []).map(imageUrl),
    kind: d.kind,
    type: TYPE[d.kind] || d.kind,
    status: d.status || "Approved",
    reports: reports.get(String(d._id)) || 0,
    likes: d.likes, comments: d.comments, shares: d.shares,
    createdAt: d.createdAt,
  }));
  return ok({ items, pagination: pagination(page, limit, total) }, "Posts fetched");
});
