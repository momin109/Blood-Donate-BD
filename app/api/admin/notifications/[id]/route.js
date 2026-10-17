import { connectDB } from "@/lib/db";
import { ApiError, ok, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { parseId } from "@/lib/validators/common";
import Image from "@/models/Image";
import Notification from "@/models/Notification";

export const dynamic = "force-dynamic";

// Notification মোছা (ছবিসহ)। যাদের ডিভাইসে Push ইতিমধ্যে পৌঁছেছে সেটি ফেরানো যায় না।
export const DELETE = withApi(async (req, { params }) => {
  await requireAdmin(req);
  const id = parseId(params.id, "notification id");
  await connectDB();
  const n = await Notification.findByIdAndDelete(id);
  if (!n) throw new ApiError(404, "Notification not found");
  if (n.image) await Image.deleteOne({ _id: n.image });
  return ok(null, "Notification deleted");
});
