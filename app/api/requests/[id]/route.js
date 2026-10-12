import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { PUBLIC_REQUEST_STATUSES } from "@/lib/constants";
import { serializeRequests } from "@/lib/requests";
import { parseId } from "@/lib/validators/common";
import { requestStatusSchema } from "@/lib/validators/request";
import BloodRequest from "@/models/BloodRequest";

export const dynamic = "force-dynamic";

// Approved/Fulfilled সবাই দেখতে পায়; অন্য status শুধু মালিক দেখে (নইলে 404)
export const GET = withApi(async (req, { params }) => {
  const id = parseId(params.id, "request id");
  await connectDB();
  const viewer = await getAuthUser(req);

  const doc = await BloodRequest.findById(id).lean();
  const isOwner = doc && viewer && String(doc.requester) === String(viewer._id);
  if (!doc || (!PUBLIC_REQUEST_STATUSES.includes(doc.status) && !isOwner)) throw new ApiError(404, "Request not found");

  const [request] = await serializeRequests([doc], viewer);
  return ok({ request }, "Request fetched");
});

// শুধু মালিক: "Fulfilled" চিহ্নিত করা
export const PATCH = withApi(async (req, { params }) => {
  const me = await requireAuth(req);
  const id = parseId(params.id, "request id");
  const { status } = await parseBody(req, requestStatusSchema);
  await connectDB();

  const doc = await BloodRequest.findById(id);
  if (!doc) throw new ApiError(404, "Request not found");
  if (String(doc.requester) !== String(me._id)) throw new ApiError(403, "You can only update your own requests");
  if (!["Approved", "Fulfilled"].includes(doc.status)) throw new ApiError(409, `A ${doc.status.toLowerCase()} request cannot be changed`);

  doc.status = status;
  await doc.save();
  const [request] = await serializeRequests([doc.toObject()], me);
  return ok({ request }, "Request marked as fulfilled");
});

// শুধু মালিক: নিজের অনুরোধ মুছে ফেলা
export const DELETE = withApi(async (req, { params }) => {
  const me = await requireAuth(req);
  const id = parseId(params.id, "request id");
  await connectDB();

  const doc = await BloodRequest.findById(id);
  if (!doc) throw new ApiError(404, "Request not found");
  if (String(doc.requester) !== String(me._id)) throw new ApiError(403, "You can only delete your own requests");

  await doc.deleteOne();
  return ok(null, "Request deleted");
});
