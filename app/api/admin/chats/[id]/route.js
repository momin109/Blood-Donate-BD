import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { deleteConversations } from "@/lib/chat";
import { emitConversationUpdated } from "@/lib/realtime";
import { parseId } from "@/lib/validators/common";
import { adminChatAction } from "@/lib/validators/chat";
import ChatReport from "@/models/ChatReport";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";

export const dynamic = "force-dynamic";
const MAX_VIEW = 200; // Admin একবারে সর্বশেষ এতগুলো মেসেজ দেখে

// একটি conversation-এর মেসেজ (পুরনো → নতুন) ও তার report
export const GET = withApi(async (req, { params }) => {
  await requireAdmin(req);
  const id = parseId(params.id, "conversation id");
  await connectDB();
  const conv = await Conversation.findById(id).lean();
  if (!conv) throw new ApiError(404, "Conversation not found");

  const [users, docs, total, reports] = await Promise.all([
    User.find({ _id: { $in: conv.participants } }).select("name donorId").lean(),
    Message.find({ conversation: id }).sort({ _id: -1 }).limit(MAX_VIEW).lean(),
    Message.countDocuments({ conversation: id }),
    ChatReport.find({ conversation: id }).sort({ createdAt: -1 }).limit(20).lean(),
  ]);
  const nameById = new Map(users.map((u) => [String(u._id), u.name]));
  return ok(
    {
      conversation: {
        id: String(conv._id),
        locked: !!conv.locked,
        participants: conv.participants.map((p) => ({ id: String(p), name: nameById.get(String(p)) || "Deleted user" })),
        totalMessages: total,
      },
      messages: docs.reverse().map((m) => ({ id: String(m._id), senderId: String(m.sender), senderName: nameById.get(String(m.sender)) || "Deleted user", text: m.text, createdAt: m.createdAt })),
      reports: reports.map((r) => ({ id: String(r._id), by: nameById.get(String(r.reporter)) || "Deleted user", reason: r.reason, status: r.status, createdAt: r.createdAt })),
    },
    "Chat fetched"
  );
});

// lock = নতুন মেসেজ বন্ধ | unlock = আবার চালু
export const PATCH = withApi(async (req, { params }) => {
  await requireAdmin(req);
  const id = parseId(params.id, "conversation id");
  const { action } = await parseBody(req, adminChatAction);
  await connectDB();
  const conv = await Conversation.findById(id).select("participants").lean();
  if (!conv) throw new ApiError(404, "Conversation not found");
  await Conversation.updateOne({ _id: id }, { $set: { locked: action === "lock" } });
  emitConversationUpdated(conv);
  return ok({ id, locked: action === "lock" }, action === "lock" ? "Conversation locked" : "Conversation unlocked");
});

// conversation, তার সব মেসেজ ও report মুছে ফেলা
export const DELETE = withApi(async (req, { params }) => {
  await requireAdmin(req);
  const id = parseId(params.id, "conversation id");
  await connectDB();
  const conv = await Conversation.findById(id).select("participants").lean();
  if (!conv || !(await deleteConversations({ _id: id }))) throw new ApiError(404, "Conversation not found");
  emitConversationUpdated(conv);
  return ok(null, "Conversation deleted");
});
