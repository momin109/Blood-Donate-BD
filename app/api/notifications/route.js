import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { userNotification, visibleFilter } from "@/lib/notifications";
import { parseQuery } from "@/lib/query";
import { notificationsQuery } from "@/lib/validators/notification";
import Notification from "@/models/Notification";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// আমার notification: ?limit= &before=<ISO date>  →  { items, hasMore, unreadCount }
export const GET = withApi(async (req) => {
  const me = await requireAuth(req);
  const { limit, before } = parseQuery(req, notificationsQuery);
  await connectDB();
  const base = visibleFilter(me);
  const seenAt = me.notificationsSeenAt || me.createdAt;
  const [rows, unreadCount] = await Promise.all([
    Notification.find(before ? { $and: [base, { createdAt: { $lt: before } }] } : base)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .select("-recipients")
      .lean(),
    Notification.countDocuments({ $and: [base, { createdAt: { $gt: seenAt } }] }),
  ]);
  const hasMore = rows.length > limit;
  return ok({ items: rows.slice(0, limit).map((n) => userNotification(n, seenAt)), hasMore, unreadCount }, "Notifications fetched");
});

// সব "পড়া হয়েছে" হিসেবে চিহ্নিত করা (bell খুললে/পেজ দেখলে)
export const PATCH = withApi(async (req) => {
  const me = await requireAuth(req);
  await connectDB();
  await User.updateOne({ _id: me._id }, { $set: { notificationsSeenAt: new Date() } });
  return ok({ unreadCount: 0 }, "Marked as read");
});
