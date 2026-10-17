import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { findHospitalConflict, hospitalKey } from "@/lib/ranking";
import { donationSubmitSchema } from "@/lib/validators/donation";
import Donation from "@/models/Donation";

export const dynamic = "force-dynamic";
const MAX_PENDING = 5; // অনুমোদনের অপেক্ষায় একসাথে এর বেশি জমা দেওয়া যাবে না (spam ঠেকাতে)

const toDonation = (d) => ({
  id: String(d._id),
  hospital: d.hospital,
  donatedAt: d.donatedAt,
  status: d.status,
  rating: d.rating ?? null,
  note: d.status === "Rejected" ? d.note || "" : "", // Admin-এর বাতিলের কারণ
  createdAt: d.createdAt,
});

// আমার জমা দেওয়া রক্তদানের তালিকা + র‍্যাংকের সারাংশ
export const GET = withApi(async (req) => {
  const me = await requireAuth(req);
  await connectDB();
  const items = await Donation.find({ donor: me._id }).sort({ donatedAt: -1, _id: -1 }).limit(50).lean();
  return ok(
    {
      items: items.map(toDonation),
      summary: { rank: me.donorRank || 0, badge: me.badgeType || "none", score: me.donorScore || 0, donations: me.rankDonations || 0, avgRating: me.avgRating || 0 },
    },
    "Donations fetched"
  );
});

// নতুন রক্তদান জমা (Pending) — Admin অনুমোদন করলে র‍্যাংকে গোনা হয়
export const POST = withApi(async (req) => {
  const me = await requireAuth(req);
  const { hospital, donatedAt } = await parseBody(req, donationSubmitSchema);
  await connectDB();

  if ((await Donation.countDocuments({ donor: me._id, status: "Pending" })) >= MAX_PENDING) {
    throw new ApiError(429, `You already have ${MAX_PENDING} donations waiting for approval`);
  }
  const key = hospitalKey(hospital);
  const date = new Date(donatedAt);
  // Anti-Fake: একই হাসপাতালে ৩ মাসের মধ্যে আরেকটি দান নয়
  if (await findHospitalConflict(me._id, key, date, { statuses: ["Pending", "Approved"] })) {
    const message = "You already have a donation at this hospital within 3 months";
    throw new ApiError(409, message, [{ field: "hospital", message }]);
  }
  const donation = await Donation.create({ donor: me._id, hospital, hospitalKey: key, donatedAt: date });
  return ok({ donation: toDonation(donation) }, "Donation submitted for approval", 201);
});
