import { connectDB } from "@/lib/db";
import { ok, parseBody, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { deletePosts, findPostOr404 } from "@/lib/posts";
import { syncRequestWithPost } from "@/lib/admin";
import { parseId } from "@/lib/validators/common";
import { adminPostStatus } from "@/lib/validators/admin";
import BloodRequest from "@/models/BloodRequest";

export const dynamic = "force-dynamic";

// Approve (দেখানো) / Pending / Reject (লুকানো)
export const PATCH = withApi(async (req, { params }) => {
  await requireAdmin(req);
  const id = parseId(params.id, "post id");
  const { status } = await parseBody(req, adminPostStatus);
  await connectDB();
  const post = await findPostOr404(id);
  post.status = status;
  await post.save();
  await syncRequestWithPost(post);
  return ok({ id, status }, `Post ${status.toLowerCase()}`);
});

export const DELETE = withApi(async (req, { params }) => {
  await requireAdmin(req);
  const id = parseId(params.id, "post id");
  await connectDB();
  const post = await findPostOr404(id);
  await deletePosts({ _id: post._id });
  if (post.request) await BloodRequest.deleteOne({ _id: post.request });
  return ok(null, "Post deleted");
});
