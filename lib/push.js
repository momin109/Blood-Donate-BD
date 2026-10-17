import webpush from "web-push";
import PushSubscription from "@/models/PushSubscription";
import User from "@/models/User";

// VAPID key .env.local থেকে: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:… বা https://…)
export function pushConfig() {
  const publicKey = (process.env.VAPID_PUBLIC_KEY || "").trim();
  const privateKey = (process.env.VAPID_PRIVATE_KEY || "").trim();
  return { publicKey, privateKey, subject: (process.env.VAPID_SUBJECT || "").trim() || "mailto:admin@example.com", enabled: !!(publicKey && privateKey) };
}

let ready = null;
function setup() {
  if (ready !== null) return ready;
  const c = pushConfig();
  ready = false;
  if (c.enabled) {
    try {
      webpush.setVapidDetails(c.subject, c.publicKey, c.privateKey);
      ready = true;
    } catch (err) {
      console.error("[push] Invalid VAPID configuration:", err.message);
    }
  }
  return ready;
}

// key দেওয়া আছে এবং বৈধ — তবেই true
export const pushReady = () => setup();

const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const BATCH = 50; // একসাথে সর্বোচ্চ কয়টি push পাঠানো হবে

// Notification-এর push পাঠায়। userIds = null হলে সবাইকে (Blocked বাদে); array হলে শুধু সেই user-দের।
// কখনো throw করে না — Push ব্যর্থ হলেও in-app Notification তৈরি থাকে। ফেরত: { targeted, sent, failed }
export async function sendPush({ userIds = null, notification }) {
  const result = { targeted: 0, sent: 0, failed: 0 };
  if (!setup()) return result;
  try {
    const filter = {};
    if (userIds) filter.user = { $in: userIds };
    else {
      const blocked = await User.find({ status: "Blocked" }).distinct("_id");
      if (blocked.length) filter.user = { $nin: blocked };
    }

    // Payload ছোট রাখা হয় (সীমা ~৪KB)। ছবির লিংক relative — service worker নিজের origin-এ পূর্ণ করে নেয়।
    const payload = JSON.stringify({
      id: String(notification._id),
      title: clip(notification.title, 80),
      body: clip(notification.message, 200),
      url: notification.url || "/notifications",
      image: notification.image ? `/api/images/${notification.image}` : null,
      tag: `n-${notification._id}`,
    });

    const gone = [];
    const sendOne = async (sub) => {
      result.targeted++;
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload, { TTL: 60 * 60 * 24, urgency: "high" });
        result.sent++;
      } catch (err) {
        result.failed++;
        if (err.statusCode === 404 || err.statusCode === 410) gone.push(sub._id); // browser-এ subscription মুছে গেছে
        else console.error("[push] send failed:", err.statusCode || err.message);
      }
    };

    let batch = [];
    for await (const sub of PushSubscription.find(filter).select("endpoint keys").lean().cursor()) {
      batch.push(sub);
      if (batch.length >= BATCH) {
        await Promise.all(batch.map(sendOne));
        batch = [];
      }
    }
    if (batch.length) await Promise.all(batch.map(sendOne));
    if (gone.length) await PushSubscription.deleteMany({ _id: { $in: gone } });
  } catch (err) {
    console.error("[push] error:", err);
  }
  return result;
}
