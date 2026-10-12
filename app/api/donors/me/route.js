import { connectDB } from "@/lib/db";
import { ok, parseBody, withApi } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/validators/donor";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// নিজের profile বদলানো ও availability toggle (শুধু অনুমোদিত field)
export const PATCH = withApi(async (req) => {
  const user = await requireAuth(req);
  const updates = await parseBody(req, profileUpdateSchema);
  await connectDB();

  if (updates.lastDonationDate !== undefined) {
    updates.lastDonationDate = updates.lastDonationDate === null ? null : new Date(updates.lastDonationDate);
  }
  user.set(updates);
  await user.save();
  return ok({ user }, "Profile updated");
});
