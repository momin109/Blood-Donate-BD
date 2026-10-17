import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { pagination, parseQuery } from "@/lib/query";
import { adminReportsQuery } from "@/lib/validators/admin";
import Post from "@/models/Post";
import PostAction from "@/models/PostAction";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// ব্যবহারকারীদের করা post report: ?status=Open|Resolved|Dismissed
export const GET = withApi(async (req) => {
  await requireAdmin(req);
  const { status, page, limit } = parseQuery(req, adminReportsQuery);
  await connectDB();
  const filter = { type: "report" };
  if (status) filter.status = status;
  const [total, docs] = await Promise.all([
    PostAction.countDocuments(filter),
    PostAction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  const [posts, users] = await Promise.all([
    Post.find({ _id: { $in: docs.map((d) => d.post) } }).select("text status author kind").lean(),
    User.find({ _id: { $in: docs.map((d) => d.user) } }).select("name").lean(),
  ]);
  const postById = new Map(posts.map((p) => [String(p._id), p]));
  const userById = new Map(users.map((u) => [String(u._id), u]));
  const items = docs.map((d) => {
    const p = postById.get(String(d.post));
    return {
      id: String(d._id),
      post: p ? { id: String(p._id), text: p.text || "(Photo post)", status: p.status || "Approved", kind: p.kind } : null,
      reason: d.reason,
      by: userById.get(String(d.user))?.name || "Unknown",
      status: d.status || "Open",
      createdAt: d.createdAt,
    };
  });
  return ok({ items, pagination: pagination(page, limit, total) }, "Reports fetched");
});
