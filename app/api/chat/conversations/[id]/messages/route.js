import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { getMyConversation, otherParticipant, toMessage } from "@/lib/chat";
import { emitNewMessage } from "@/lib/realtime";
import { parseQuery } from "@/lib/query";
import { parseId } from "@/lib/validators/common";
import { messagesQuery, sendMessageSchema } from "@/lib/validators/chat";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// স্প্যাম ঠেকাতে: ১০ সেকেন্ডে সর্বোচ্চ ১০টি মেসেজ
const RATE_WINDOW_MS = 10_000;
const RATE_MAX = 10;

// মেসেজ তালিকা (পুরনো → নতুন)।
//   ?limit=30            → সর্বশেষ ৩০টি, hasMore সহ
//   ?before=<messageId>  → তার আগের পুরনো মেসেজ ("আগের মেসেজ" বাটন)
//   ?after=<messageId>   → তার পরের নতুন মেসেজ (নতুন মেসেজ খোঁজা)
// শুধু conversation-এর participant দেখতে পারে; দেখলে "পড়া হয়েছে" ধরা হয়।
export const GET = withApi(async (req, { params }) => {
  const me = await requireAuth(req);
  const id = parseId(params.id, "conversation id");
  const { before, after, limit } = parseQuery(req, messagesQuery);
  await connectDB();
  await getMyConversation(id, me);

  let items;
  let hasMore = false;
  if (after) {
    items = await Message.find({ conversation: id, _id: { $gt: after } }).sort({ _id: 1 }).limit(100).lean();
  } else {
    const docs = await Message.find({ conversation: id, ...(before ? { _id: { $lt: before } } : {}) })
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean();
    hasMore = docs.length > limit;
    items = docs.slice(0, limit).reverse();
  }
  if (!before) await Conversation.updateOne({ _id: id }, { $set: { [`lastRead.${me._id}`]: new Date() } });
  return ok({ items: items.map((m) => toMessage(m, me)), hasMore }, "Messages fetched");
});

// মেসেজ পাঠানো
export const POST = withApi(async (req, { params }) => {
  const me = await requireAuth(req);
  const id = parseId(params.id, "conversation id");
  const { text } = await parseBody(req, sendMessageSchema);
  await connectDB();
  const conv = await getMyConversation(id, me);
  if (conv.locked) throw new ApiError(403, "This conversation has been locked by an admin");

  const other = await User.findById(otherParticipant(conv, me._id)).select("status role").lean();
  if (!other || other.status !== "Active") throw new ApiError(403, "You cannot message this user");

  const recent = await Message.countDocuments({ sender: me._id, createdAt: { $gt: new Date(Date.now() - RATE_WINDOW_MS) } });
  if (recent >= RATE_MAX) throw new ApiError(429, "You are sending messages too fast. Please wait a moment");

  const msg = await Message.create({ conversation: conv._id, sender: me._id, text });
  await Conversation.updateOne(
    { _id: conv._id },
    { $set: { lastMessage: { text: text.slice(0, 120), sender: me._id, at: msg.createdAt }, lastMessageAt: msg.createdAt, [`lastRead.${me._id}`]: msg.createdAt } }
  );
  emitNewMessage(conv, msg); // DB-তে save হওয়ার পর receiver-কে real-time পাঠানো
  return ok({ message: toMessage(msg, me) }, "Message sent", 201);
});
