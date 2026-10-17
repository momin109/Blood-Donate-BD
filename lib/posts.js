import { ApiError } from "@/lib/api";
import { imageUrl } from "@/lib/serializers";
import { serializeRequests } from "@/lib/requests";
import BloodRequest from "@/models/BloodRequest";
import Comment from "@/models/Comment";
import Image from "@/models/Image";
import Post from "@/models/Post";
import PostAction from "@/models/PostAction";
import User from "@/models/User";

export const AUTHOR_FIELDS = "name donorId bloodGroup district upazila photo";

export const toAuthor = (u) =>
  u
    ? { id: String(u._id), name: u.name, donorId: u.donorId, bloodGroup: u.bloodGroup, district: u.district, upazila: u.upazila, photo: imageUrl(u.photo) }
    : null;

// Post document → API response (author, ছবির URL, request-এর তথ্য, viewer-এর like/save সহ)
export async function serializePosts(docs, viewer = null) {
  if (!docs.length) return [];
  const postIds = docs.map((d) => d._id);
  const requestIds = docs.filter((d) => d.request).map((d) => d.request);

  const [users, reqDocs, actions] = await Promise.all([
    User.find({ _id: { $in: [...new Set(docs.map((d) => String(d.author)))] } }).select(AUTHOR_FIELDS).lean(),
    requestIds.length ? BloodRequest.find({ _id: { $in: requestIds } }).lean() : [],
    viewer ? PostAction.find({ user: viewer._id, post: { $in: postIds }, type: { $in: ["like", "save"] } }).lean() : [],
  ]);
  const authors = new Map(users.map((u) => [String(u._id), u]));
  const requests = new Map((await serializeRequests(reqDocs, viewer)).map((r) => [r.id, r]));
  const liked = new Set(actions.filter((a) => a.type === "like").map((a) => String(a.post)));
  const saved = new Set(actions.filter((a) => a.type === "save").map((a) => String(a.post)));

  return docs.map((d) => ({
    id: String(d._id),
    kind: d.kind,
    text: d.text || "",
    images: (d.images || []).map(imageUrl),
    createdAt: d.createdAt,
    likes: d.likes,
    comments: d.comments,
    shares: d.shares,
    author: toAuthor(authors.get(String(d.author))),
    request: d.request ? requests.get(String(d.request)) ?? null : null,
    ...(viewer ? { isLiked: liked.has(String(d._id)), isSaved: saved.has(String(d._id)), isOwner: String(d.author) === String(viewer._id) } : { isLiked: false, isSaved: false, isOwner: false }),
  }));
}

export async function findPostOr404(id) {
  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, "Post not found");
  return post;
}

// post মুছলে তার ছবি, like/save/report, comment সব মুছে যায়
export async function deletePosts(filter) {
  const posts = await Post.find(filter).select("_id images").lean();
  if (!posts.length) return 0;
  const ids = posts.map((p) => p._id);
  await Promise.all([
    Image.deleteMany({ _id: { $in: posts.flatMap((p) => p.images || []) } }),
    PostAction.deleteMany({ post: { $in: ids } }),
    Comment.deleteMany({ post: { $in: ids } }),
    Post.deleteMany({ _id: { $in: ids } }),
  ]);
  return ids.length;
}

// like/save/share/report চালু বা বন্ধ করা (idempotent)। counter দিলে Post-এর সংখ্যাও ঠিক রাখে।
export async function setAction(postId, userId, type, on, { counter, reason } = {}) {
  const key = { post: postId, user: userId, type };
  if (on) {
    let created = false;
    try {
      const r = await PostAction.updateOne(key, { $setOnInsert: key, ...(reason ? { $set: { reason } } : {}) }, { upsert: true });
      created = r.upsertedCount > 0;
    } catch (e) {
      if (e?.code !== 11000) throw e; // দুটি request একসাথে এলে — ইতিমধ্যে আছে ধরা হয়
    }
    if (created && counter) await Post.updateOne({ _id: postId }, { $inc: { [counter]: 1 } });
  } else {
    const r = await PostAction.deleteOne(key);
    if (r.deletedCount && counter) await Post.updateOne({ _id: postId }, { $inc: { [counter]: -1 } });
  }
  if (!counter) return undefined;
  const p = await Post.findById(postId).select(counter).lean();
  return p?.[counter] ?? 0;
}

// ছবির প্রথম কয়েক byte দেখে আসল ধরন চেনা (ক্লায়েন্টের পাঠানো type বিশ্বাস করা হয় না)
export function sniffImageType(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  const head = buf.subarray(0, 6).toString("latin1");
  if (head === "GIF87a" || head === "GIF89a") return "image/gif";
  if (buf.subarray(0, 4).toString("latin1") === "RIFF" && buf.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  return null;
}
