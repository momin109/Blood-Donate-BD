import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { adminDonor, purgeUser } from "@/lib/admin";
import { parseId } from "@/lib/validators/common";
import { adminDonorUpdate } from "@/lib/validators/admin";
import User from "@/models/User";

export const dynamic = "force-dynamic";

async function findDonor(id) {
  const user = await User.findOne({ _id: id, role: "user" });
  if (!user) throw new ApiError(404, "Donor not found");
  return user;
}

// তথ্য বদলানো, Block/Unblock (status), পাসওয়ার্ড রিসেট
export const PATCH = withApi(async (req, { params }) => {
  await requireAdmin(req);
  const id = parseId(params.id, "donor id");
  const { password, lastDonationDate, ...updates } = await parseBody(req, adminDonorUpdate);
  await connectDB();
  const user = await findDonor(id);

  if (updates.phone && updates.phone !== user.phone && (await User.exists({ phone: updates.phone, _id: { $ne: user._id } }))) {
    throw new ApiError(409, "This mobile number is already registered", [{ field: "phone", message: "This mobile number is already registered" }]);
  }
  user.set(updates);
  if (lastDonationDate !== undefined) user.lastDonationDate = lastDonationDate ? new Date(lastDonationDate) : undefined;
  if (password) user.passwordHash = await bcrypt.hash(password, 12);
  await user.save();
  return ok({ donor: adminDonor(user) }, "Donor updated");
});

// Donor ও তার সব পোস্ট/কমেন্ট/অনুরোধ মুছে ফেলা
export const DELETE = withApi(async (req, { params }) => {
  await requireAdmin(req);
  const id = parseId(params.id, "donor id");
  await connectDB();
  await purgeUser(await findDonor(id));
  return ok(null, "Donor deleted");
});
