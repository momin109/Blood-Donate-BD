import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/validators/donor";
import Image from "@/models/Image";

export const dynamic = "force-dynamic";

// নিজের profile বদলানো (নাম, রক্তের গ্রুপ, ঠিকানা, ছবি, availability…) — শুধু অনুমোদিত field
export const PATCH = withApi(async (req) => {
  const user = await requireAuth(req);
  const { photo, ...updates } = await parseBody(req, profileUpdateSchema);
  await connectDB();

  if (updates.lastDonationDate !== undefined) {
    updates.lastDonationDate = updates.lastDonationDate === null ? null : new Date(updates.lastDonationDate);
  }
  user.set(updates);

  // profile ছবি: photo = POST /api/uploads (purpose=avatar) থেকে পাওয়া id, অথবা null (মুছে ফেলা)
  if (photo !== undefined) {
    const old = user.photo;
    if (photo === null) {
      user.photo = undefined;
    } else {
      const img = await Image.findOne({ _id: photo, owner: user._id, purpose: "avatar" }).select("_id");
      if (!img) throw new ApiError(400, "Invalid photo", [{ field: "photo", message: "Upload the photo again" }]);
      user.photo = img._id;
      await Image.updateOne({ _id: img._id }, { attached: true });
    }
    if (old && String(old) !== String(user.photo || "")) await Image.deleteOne({ _id: old }); // পুরনো ছবি মুছে ফেলা
  }

  await user.save();
  return ok({ user }, "Profile updated");
});
