import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { CHAT_USER_FIELDS, otherParticipant, participantKey, toConversation, unreadCount } from "@/lib/chat";
import { startChatSchema } from "@/lib/validators/chat";
import Conversation from "@/models/Conversation";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// আমার সব conversation (অন্তত একটি মেসেজ আছে এমন), নতুনটি আগে। unread সংখ্যা সহ
export const GET = withApi(async (req) => {
  const me = await requireAuth(req);
  await connectDB();
  const convs = await Conversation.find({ participants: me._id, "lastMessage.at": { $exists: true } })
    .sort({ lastMessageAt: -1 })
    .limit(50)
    .lean();
  const users = await User.find({ _id: { $in: convs.map((c) => otherParticipant(c, me._id)) } }).select(CHAT_USER_FIELDS).lean();
  const usersById = new Map(users.map((u) => [String(u._id), u]));
  const unread = await Promise.all(convs.map((c) => unreadCount(c, me._id)));
  return ok({ items: convs.map((c, i) => toConversation(c, me, usersById, unread[i])) }, "Conversations fetched");
});

// কারও সাথে chat শুরু (আগের conversation থাকলে সেটিই ফেরত আসে)
export const POST = withApi(async (req) => {
  const me = await requireAuth(req);
  const { userId } = await parseBody(req, startChatSchema);
  if (String(userId) === String(me._id)) throw new ApiError(400, "You cannot message yourself");
  await connectDB();
  const other = await User.findOne({ _id: userId, role: "user", status: "Active" }).select(CHAT_USER_FIELDS).lean();
  if (!other) throw new ApiError(404, "User not found");

  const key = participantKey(me._id, other._id);
  const find = () => Conversation.findOne({ participantKey: key }).lean();
  let conv = await find();
  if (!conv) {
    try {
      conv = (await Conversation.create({ participants: [me._id, other._id], participantKey: key })).toObject({ flattenMaps: true });
    } catch (err) {
      if (err?.code !== 11000) throw err;
      conv = await find(); // দুজন একসাথে শুরু করলে যেটি আগে তৈরি হয়েছে সেটি নেওয়া
    }
  }
  const unread = await unreadCount(conv, me._id);
  return ok({ conversation: toConversation(conv, me, new Map([[String(other._id), other]]), unread) }, "Conversation ready");
});
