import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { HIDDEN_POST_STATUSES } from "@/lib/constants";
import { serializePosts } from "@/lib/posts";
import { pagination, parseQuery } from "@/lib/query";
import { postCreateSchema, postQuerySchema } from "@/lib/validators/post";
import Image from "@/models/Image";
import Post from "@/models/Post";
import PostAction from "@/models/PostAction";

export const dynamic = "force-dynamic";

const MAX_POSTS_PER_HOUR = 10; // spam ঠেকাতে

// Home feed: সবার জন্য খোলা। ?author=<userId> একজনের পোস্ট, ?saved=true নিজের সেভ করা পোস্ট (login লাগবে)
export const GET = withApi(async (req) => {
  const { author, kind, saved, page, limit } = parseQuery(req, postQuerySchema);
  await connectDB();
  const viewer = await getAuthUser(req);

  const filter = {};
  // Admin যে পোস্ট Pending/Rejected করেছে তা অন্যদের কাছে লুকানো থাকে (লেখক নিজের পোস্ট দেখতে পায়)
  if (!(author && viewer && String(viewer._id) === author) && viewer?.role !== "admin") {
    filter.status = { $nin: HIDDEN_POST_STATUSES };
  }
  if (author) filter.author = author;
  if (kind) filter.kind = kind;
  if (saved) {
    const me = await requireAuth(req);
    const acts = await PostAction.find({ user: me._id, type: "save" }).sort({ createdAt: -1 }).limit(500).select("post").lean();
    filter._id = { $in: acts.map((a) => a.post) };
  }

  const [total, docs] = await Promise.all([
    Post.countDocuments(filter),
    Post.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  return ok({ items: await serializePosts(docs, viewer), pagination: pagination(page, limit, total) }, "Posts fetched");
});

// নতুন পোস্ট (লেখা ও/অথবা ছবি)। ছবি আগে POST /api/uploads দিয়ে আপলোড করে id পাঠাতে হয়।
export const POST = withApi(async (req) => {
  const me = await requireAuth(req);
  const input = await parseBody(req, postCreateSchema);
  await connectDB();

  const recent = await Post.countDocuments({ author: me._id, kind: { $ne: "request" }, createdAt: { $gt: new Date(Date.now() - 3600 * 1000) } });
  if (recent >= MAX_POSTS_PER_HOUR) throw new ApiError(429, "You are posting too fast. Please try again later");

  if (input.images.length) {
    const own = await Image.countDocuments({ _id: { $in: input.images }, owner: me._id, purpose: "post" });
    if (own !== new Set(input.images).size) {
      throw new ApiError(400, "Invalid image", [{ field: "images", message: "One or more images are invalid. Upload them again" }]);
    }
  }

  const doc = await Post.create({ author: me._id, kind: input.kind, text: input.text, images: [...new Set(input.images)] });
  if (input.images.length) await Image.updateMany({ _id: { $in: doc.images } }, { attached: true });

  const [post] = await serializePosts([doc.toObject()], me);
  return ok({ post }, "Post created", 201);
});
