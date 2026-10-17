import { connectDB } from "@/lib/db";
import { ok, parseBody, withApi } from "@/lib/api";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { findPostOr404, toAuthor, AUTHOR_FIELDS } from "@/lib/posts";
import { pagination, parseQuery } from "@/lib/query";
import { parseId } from "@/lib/validators/common";
import { commentQuerySchema, commentSchema } from "@/lib/validators/post";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import User from "@/models/User";

export const dynamic = "force-dynamic";

async function serializeComments(docs, post, viewer) {
  const users = await User.find({ _id: { $in: [...new Set(docs.map((c) => String(c.author)))] } }).select(AUTHOR_FIELDS).lean();
  const byId = new Map(users.map((u) => [String(u._id), u]));
  return docs.map((c) => ({
    id: String(c._id),
    text: c.text,
    createdAt: c.createdAt,
    author: toAuthor(byId.get(String(c.author))),
    // কমেন্টকারী অথবা পোস্টের মালিক মুছতে পারে
    canDelete: !!viewer && (String(c.author) === String(viewer._id) || String(post.author) === String(viewer._id)),
  }));
}

// পুরনো কমেন্ট আগে
export const GET = withApi(async (req, { params }) => {
  const id = parseId(params.id, "post id");
  const { page, limit } = parseQuery(req, commentQuerySchema);
  await connectDB();
  const viewer = await getAuthUser(req);
  const post = await findPostOr404(id);
  const [total, docs] = await Promise.all([
    Comment.countDocuments({ post: id }),
    Comment.find({ post: id }).sort({ createdAt: 1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  return ok({ items: await serializeComments(docs, post, viewer), pagination: pagination(page, limit, total) }, "Comments fetched");
});

export const POST = withApi(async (req, { params }) => {
  const me = await requireAuth(req);
  const id = parseId(params.id, "post id");
  const { text } = await parseBody(req, commentSchema);
  await connectDB();
  const post = await findPostOr404(id);
  const doc = await Comment.create({ post: id, author: me._id, text });
  const updated = await Post.findByIdAndUpdate(id, { $inc: { comments: 1 } }, { new: true }).select("comments").lean();
  const [comment] = await serializeComments([doc.toObject()], post, me);
  return ok({ comment, comments: updated?.comments ?? 0 }, "Comment added", 201);
});
