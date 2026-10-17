import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { findHospitalConflict, recomputeRanking } from "@/lib/ranking";
import { parseId } from "@/lib/validators/common";
import { adminDonationReview } from "@/lib/validators/donation";
import Donation from "@/models/Donation";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// approve = র‍্যাংকে গোনা হবে (+ response/call/rating যাচাই) | reject = গোনা হবে না। আগের সিদ্ধান্তও বদলানো যায়।
export const PATCH = withApi(async (req, { params }) => {
  const admin = await requireAdmin(req);
  const id = parseId(params.id, "donation id");
  const { action, respondedWithinHour, callReceived, rating, note } = await parseBody(req, adminDonationReview);
  await connectDB();
  const donation = await Donation.findById(id);
  if (!donation) throw new ApiError(404, "Donation not found");

  const prev = donation.status;
  const next = action === "approve" ? "Approved" : "Rejected";
  if (next === "Approved" && (await findHospitalConflict(donation.donor, donation.hospitalKey, donation.donatedAt, { statuses: ["Approved"], excludeId: donation._id }))) {
    throw new ApiError(409, "This donor already has an approved donation at this hospital within 3 months");
  }

  donation.status = next;
  if (respondedWithinHour !== undefined) donation.respondedWithinHour = respondedWithinHour;
  if (callReceived !== undefined) donation.callReceived = callReceived;
  donation.rating = rating ?? undefined;
  donation.note = note || undefined;
  donation.reviewedAt = new Date();
  donation.reviewedBy = admin._id;
  await donation.save();

  // Donor-এর profile সংখ্যা মেলানো (donationCount / lastDonationDate)
  if (prev !== "Approved" && next === "Approved") {
    await User.updateOne({ _id: donation.donor }, { $inc: { donationCount: 1 } });
    await User.updateOne({ _id: donation.donor, $or: [{ lastDonationDate: { $exists: false } }, { lastDonationDate: null }, { lastDonationDate: { $lt: donation.donatedAt } }] }, { $set: { lastDonationDate: donation.donatedAt } });
  } else if (prev === "Approved" && next !== "Approved") {
    await User.updateOne({ _id: donation.donor, donationCount: { $gt: 0 } }, { $inc: { donationCount: -1 } });
  }

  await recomputeRanking();
  return ok({ id, status: next }, next === "Approved" ? "Donation approved" : "Donation rejected");
});
