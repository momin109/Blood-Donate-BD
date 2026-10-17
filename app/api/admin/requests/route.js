import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { escapeRegex, pagination, parseQuery } from "@/lib/query";
import { serializeRequests } from "@/lib/requests";
import { adminRequestsQuery } from "@/lib/validators/admin";
import BloodRequest from "@/models/BloodRequest";

export const dynamic = "force-dynamic";

// সব অনুরোধ (Pending/Rejected সহ): ?status= &bloodGroup= &q= (রোগী/হাসপাতাল)
export const GET = withApi(async (req) => {
  const me = await requireAdmin(req);
  const { q, bloodGroup, status, page, limit } = parseQuery(req, adminRequestsQuery);
  await connectDB();
  const filter = {};
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (status) filter.status = status;
  if (q) {
    const re = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ patientName: re }, { hospital: re }];
  }
  const [total, docs] = await Promise.all([
    BloodRequest.countDocuments(filter),
    BloodRequest.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  return ok({ items: await serializeRequests(docs, me), pagination: pagination(page, limit, total) }, "Requests fetched");
});
