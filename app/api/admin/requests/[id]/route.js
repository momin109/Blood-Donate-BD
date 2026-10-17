import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { postStatusForRequest } from "@/lib/admin";
import { deletePosts } from "@/lib/posts";
import { serializeRequests } from "@/lib/requests";
import { parseId } from "@/lib/validators/common";
import { adminRequestStatus } from "@/lib/validators/admin";
import BloodRequest from "@/models/BloodRequest";
import Post from "@/models/Post";

export const dynamic = "force-dynamic";

// Approve / Mark Fulfilled / Reject (feed-এর পোস্টও একই সঙ্গে দেখায়/লুকায়)
export const PATCH = withApi(async (req, { params }) => {
  const me = await requireAdmin(req);
  const id = parseId(params.id, "request id");
  const { status } = await parseBody(req, adminRequestStatus);
  await connectDB();
  const doc = await BloodRequest.findById(id);
  if (!doc) throw new ApiError(404, "Request not found");
  doc.status = status;
  await doc.save();
  await Post.updateMany({ request: doc._id }, { status: postStatusForRequest(status) });
  const [request] = await serializeRequests([doc.toObject()], me);
  return ok({ request }, `Request ${status.toLowerCase()}`);
});

export const DELETE = withApi(async (req, { params }) => {
  await requireAdmin(req);
  const id = parseId(params.id, "request id");
  await connectDB();
  const doc = await BloodRequest.findById(id);
  if (!doc) throw new ApiError(404, "Request not found");
  await deletePosts({ request: doc._id });
  await doc.deleteOne();
  return ok(null, "Request deleted");
});
