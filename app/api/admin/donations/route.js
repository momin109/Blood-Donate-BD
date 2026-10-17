import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { escapeRegex, pagination, parseQuery } from "@/lib/query";
import { adminDonationsQuery } from "@/lib/validators/donation";
import Donation from "@/models/Donation";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// রক্তদানের তালিকা: ?status=Pending|Approved|Rejected &q=<donor নাম/ID/ফোন>
export const GET = withApi(async (req) => {
  await requireAdmin(req);
  const { q, status, page, limit } = parseQuery(req, adminDonationsQuery);
  await connectDB();
  const where = {};
  if (status) where.status = status;
  if (q) {
    const re = { $regex: escapeRegex(q), $options: "i" };
    const ids = await User.find({ role: "user", $or: [{ name: re }, { donorId: re }, { phone: re }] }).select("_id").limit(200).lean();
    where.donor = { $in: ids.map((u) => u._id) };
  }
  const [total, docs] = await Promise.all([
    Donation.countDocuments(where),
    Donation.find(where).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  const users = await User.find({ _id: { $in: docs.map((d) => d.donor) } }).select("name donorId phone").lean();
  const byId = new Map(users.map((u) => [String(u._id), u]));
  const items = docs.map((d) => {
    const u = byId.get(String(d.donor));
    return {
      id: String(d._id),
      donor: { id: String(d.donor), name: u?.name || "Deleted user", donorId: u?.donorId || "", phone: u?.phone || "" },
      hospital: d.hospital,
      donatedAt: d.donatedAt,
      status: d.status,
      respondedWithinHour: !!d.respondedWithinHour,
      callReceived: !!d.callReceived,
      rating: d.rating ?? null,
      note: d.note || "",
      createdAt: d.createdAt,
    };
  });
  return ok({ items, pagination: pagination(page, limit, total) }, "Donations fetched");
});
