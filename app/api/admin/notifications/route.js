import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { adminNotification } from "@/lib/notifications";
import { pushReady, sendPush } from "@/lib/push";
import { pagination, parseQuery } from "@/lib/query";
import { adminNotificationsQuery, notificationCreate } from "@/lib/validators/notification";
import Image from "@/models/Image";
import Notification from "@/models/Notification";
import PushSubscription from "@/models/PushSubscription";
import User from "@/models/User";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Admin history: ?page= &limit=  →  { items, pagination, stats, pushEnabled }
export const GET = withApi(async (req) => {
  await requireAdmin(req);
  const { page, limit } = parseQuery(req, adminNotificationsQuery);
  await connectDB();
  const [total, rows, pushDevices, sum] = await Promise.all([
    Notification.countDocuments(),
    Notification.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select("-recipients").lean(),
    PushSubscription.countDocuments(),
    Notification.aggregate([{ $group: { _id: null, sent: { $sum: "$pushSent" } } }]),
  ]);
  return ok(
    {
      items: rows.map(adminNotification),
      pagination: pagination(page, limit, total),
      stats: { total, pushDevices, pushDelivered: sum[0]?.sent ?? 0 },
      pushEnabled: pushReady(),
    },
    "Notifications fetched"
  );
});

// Notification তৈরি + (সম্ভব হলে) Push পাঠানো
export const POST = withApi(async (req) => {
  const admin = await requireAdmin(req);
  const input = await parseBody(req, notificationCreate);
  await connectDB();

  // ছবি: আগে POST /api/uploads দিয়ে আপলোড করা, এই admin-এরই হতে হবে
  let image;
  if (input.imageId) {
    image = await Image.findOne({ _id: input.imageId, owner: admin._id }).select("_id");
    if (!image) throw new ApiError(400, "Image not found. Please upload it again", [{ field: "imageId", message: "Image not found. Please upload it again" }]);
  }

  let recipients = [];
  let recipientCount;
  if (input.audience === "selected") {
    recipients = (await User.find({ _id: { $in: input.recipients }, status: { $ne: "Blocked" } }).select("_id").lean()).map((u) => u._id);
    if (!recipients.length) throw new ApiError(400, "No valid users selected", [{ field: "recipients", message: "No valid users selected" }]);
    recipientCount = recipients.length;
  } else {
    recipientCount = await User.countDocuments({ role: "user", status: { $ne: "Blocked" } });
  }

  const doc = await Notification.create({
    title: input.title,
    message: input.message,
    url: input.url,
    image: image?._id,
    audience: input.audience,
    recipients,
    recipientCount,
    createdBy: admin._id,
  });
  if (image) await Image.updateOne({ _id: image._id }, { attached: true }); // ২৪ ঘণ্টা পরে auto-delete না হওয়ার জন্য

  const push = await sendPush({ userIds: input.audience === "selected" ? recipients : null, notification: doc });
  doc.pushTargeted = push.targeted;
  doc.pushSent = push.sent;
  doc.pushFailed = push.failed;
  await doc.save();

  return ok({ notification: adminNotification(doc), push, pushEnabled: pushReady() }, "Notification sent", 201);
});
