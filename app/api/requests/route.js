import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { PUBLIC_REQUEST_STATUSES } from "@/lib/constants";
import { pagination, parseQuery } from "@/lib/query";
import { MAX_OPEN_REQUESTS, serializeRequests } from "@/lib/requests";
import { requestCreateSchema, requestQuerySchema } from "@/lib/validators/request";
import BloodRequest from "@/models/BloodRequest";
import Post from "@/models/Post";

export const dynamic = "force-dynamic";

// সবার জন্য: Approved/Fulfilled অনুরোধ। ?mine=true হলে নিজের সব অনুরোধ (login লাগবে)
export const GET = withApi(async (req) => {
  const { bloodGroup, division, district, upazila, urgency, status, mine, page, limit } = parseQuery(req, requestQuerySchema);
  await connectDB();

  let viewer = await getAuthUser(req);
  const filter = {};
  if (mine) {
    viewer = await requireAuth(req);
    filter.requester = viewer._id;
    if (status) filter.status = status;
  } else {
    if (status && !PUBLIC_REQUEST_STATUSES.includes(status)) {
      throw new ApiError(400, "Validation failed", [{ field: "status", message: "Only Approved or Fulfilled requests are public" }]);
    }
    filter.status = status || { $in: PUBLIC_REQUEST_STATUSES };
  }
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (division) filter.division = division;
  if (district) filter.district = district;
  if (upazila) filter.upazila = upazila;
  if (urgency) filter.urgency = urgency;

  const [total, docs] = await Promise.all([
    BloodRequest.countDocuments(filter),
    BloodRequest.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  return ok({ items: await serializeRequests(docs, viewer), pagination: pagination(page, limit, total) }, "Requests fetched");
});

// Login করা user নতুন অনুরোধ করে। Auto-approve: সরাসরি "Approved" হয়ে feed-এ আসে।
export const POST = withApi(async (req) => {
  const me = await requireAuth(req);
  const input = await parseBody(req, requestCreateSchema);
  await connectDB();

  const open = await BloodRequest.countDocuments({ requester: me._id, status: { $in: ["Pending", "Approved"] } });
  if (open >= MAX_OPEN_REQUESTS) {
    throw new ApiError(429, `You already have ${MAX_OPEN_REQUESTS} open requests. Mark one as fulfilled or delete it first`);
  }

  const doc = await BloodRequest.create({ ...input, requester: me._id, status: "Approved" });
  // Home feed-এও দেখানোর জন্য একটি "request" পোস্ট তৈরি হয়
  await Post.create({
    author: me._id,
    kind: "request",
    request: doc._id,
    text: input.details || `${input.bags} ব্যাগ ${input.bloodGroup} রক্ত প্রয়োজন।`,
  });
  const [request] = await serializeRequests([doc.toObject()], me);
  return ok({ request }, "Blood request submitted", 201);
});
