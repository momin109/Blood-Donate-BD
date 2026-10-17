import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { HIDDEN_POST_STATUSES } from "@/lib/constants";
import { deletePosts, findPostOr404, serializePosts } from "@/lib/posts";
import { parseId } from "@/lib/validators/common";
import { postUpdateSchema } from "@/lib/validators/post";
import BloodRequest from "@/models/BloodRequest";

export const dynamic = "force-dynamic";

export const GET = withApi(async (req, { params }) => {
  const id = parseId(params.id, "post id");
  await connectDB();
  const viewer = await getAuthUser(req);
  const post = await findPostOr404(id);
  const isOwner = viewer && String(post.author) === String(viewer._id);
  if (HIDDEN_POST_STATUSES.includes(post.status) && !isOwner && viewer?.role !== "admin") throw new ApiError(404, "Post not found");
  const [item] = await serializePosts([post.toObject()], viewer);
  return ok({ post: item }, "Post fetched");
});

// শুধু মালিক: লেখা সম্পাদনা (রক্তের অনুরোধের পোস্ট সম্পাদনা করা যায় না)
export const PATCH = withApi(async (req, { params }) => {
  const me = await requireAuth(req);
  const id = parseId(params.id, "post id");
  const { text } = await parseBody(req, postUpdateSchema);
  await connectDB();

  const post = await findPostOr404(id);
  if (String(post.author) !== String(me._id)) throw new ApiError(403, "You can only edit your own posts");
  if (post.kind === "request") throw new ApiError(409, "Blood request posts cannot be edited");
  if (!text && !post.images.length) throw new ApiError(400, "Validation failed", [{ field: "text", message: "Write something or keep a photo" }]);

  post.text = text;
  await post.save();
  const [item] = await serializePosts([post.toObject()], me);
  return ok({ post: item }, "Post updated");
});

// শুধু মালিক: পোস্ট মোছা (রক্তের অনুরোধের পোস্ট মুছলে অনুরোধটিও মুছে যায়)
export const DELETE = withApi(async (req, { params }) => {
  const me = await requireAuth(req);
  const id = parseId(params.id, "post id");
  await connectDB();

  const post = await findPostOr404(id);
  if (String(post.author) !== String(me._id)) throw new ApiError(403, "You can only delete your own posts");
  await deletePosts({ _id: post._id });
  if (post.request) await BloodRequest.deleteOne({ _id: post.request, requester: me._id });
  return ok(null, "Post deleted");
});
