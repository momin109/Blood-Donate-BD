import { imageUrl } from "@/lib/serializers";

// এই user যেসব notification দেখতে পাবে: সবার জন্য (তার যোগ দেওয়ার পর থেকে) + তাকে নির্দিষ্টভাবে পাঠানো
export const visibleFilter = (user) => ({
  $or: [{ audience: "all", createdAt: { $gte: user.createdAt } }, { recipients: user._id }],
});

// User-এর bell/page-এর জন্য
export const userNotification = (n, seenAt) => ({
  id: String(n._id),
  title: n.title,
  message: n.message,
  image: imageUrl(n.image),
  url: n.url || "",
  createdAt: n.createdAt,
  unread: new Date(n.createdAt) > seenAt,
});

// Admin history-র জন্য
export const adminNotification = (n) => ({
  id: String(n._id),
  title: n.title,
  message: n.message,
  image: imageUrl(n.image),
  url: n.url || "",
  audience: n.audience,
  recipientCount: n.recipientCount ?? 0,
  pushTargeted: n.pushTargeted ?? 0,
  pushSent: n.pushSent ?? 0,
  pushFailed: n.pushFailed ?? 0,
  createdAt: n.createdAt,
});
