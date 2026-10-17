import { connectDB } from "@/lib/db";
import { ok, parseBody, withApi } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { pushConfig, pushReady } from "@/lib/push";
import { pushSubscriptionSchema, pushUnsubscribeSchema } from "@/lib/validators/notification";
import PushSubscription from "@/models/PushSubscription";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_DEVICES = 10; // এক user-এর সর্বোচ্চ device

// Push চালু আছে কিনা + browser-কে দেওয়ার public VAPID key
export const GET = withApi(async (req) => {
  await requireAuth(req);
  const enabled = pushReady();
  return ok({ enabled, publicKey: enabled ? pushConfig().publicKey : null }, "Push config");
});

// এই browser-এর subscription সংরক্ষণ (আবার পাঠালে আপডেট হয়; অন্য user-এর হয়ে থাকলে এই user-এর নামে চলে আসে)
export const POST = withApi(async (req) => {
  const me = await requireAuth(req);
  const { endpoint, keys } = await parseBody(req, pushSubscriptionSchema);
  await connectDB();
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { $set: { user: me._id, keys: { p256dh: keys.p256dh, auth: keys.auth }, userAgent: (req.headers.get("user-agent") || "").slice(0, 300) } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const extra = await PushSubscription.find({ user: me._id }).sort({ updatedAt: -1 }).skip(MAX_DEVICES).select("_id").lean();
  if (extra.length) await PushSubscription.deleteMany({ _id: { $in: extra.map((s) => s._id) } });
  return ok(null, "Push notification enabled", 201);
});

// এই browser-এর subscription মোছা (বন্ধ করা / logout)
export const DELETE = withApi(async (req) => {
  const me = await requireAuth(req);
  const { endpoint } = await parseBody(req, pushUnsubscribeSchema);
  await connectDB();
  await PushSubscription.deleteOne({ endpoint, user: me._id });
  return ok(null, "Push notification disabled");
});
