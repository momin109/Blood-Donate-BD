import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { escapeRegex, pagination, parseQuery } from "@/lib/query";
import { adminChatsQuery } from "@/lib/validators/chat";
import ChatReport from "@/models/ChatReport";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// সব conversation: ?q=<participant-এর নাম>&filter=Reported|Locked
export const GET = withApi(async (req) => {
  await requireAdmin(req);
  const { q, filter, page, limit } = parseQuery(req, adminChatsQuery);
  await connectDB();

  const where = { "lastMessage.at": { $exists: true } };
  if (filter === "Locked") where.locked = true;
  if (filter === "Reported") where._id = { $in: await ChatReport.distinct("conversation", { status: "Open" }) };
  if (q) {
    const ids = await User.find({ name: new RegExp(escapeRegex(q), "i") }).select("_id").limit(200).lean();
    where.participants = { $in: ids.map((u) => u._id) };
  }

  const [total, convs] = await Promise.all([
    Conversation.countDocuments(where),
    Conversation.find(where).sort({ lastMessageAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  const convIds = convs.map((c) => c._id);
  const [users, counts, reports] = await Promise.all([
    User.find({ _id: { $in: convs.flatMap((c) => c.participants) } }).select("name").lean(),
    Message.aggregate([{ $match: { conversation: { $in: convIds } } }, { $group: { _id: "$conversation", n: { $sum: 1 } } }]),
    ChatReport.aggregate([{ $match: { conversation: { $in: convIds }, status: "Open" } }, { $group: { _id: "$conversation", n: { $sum: 1 } } }]),
  ]);
  const userById = new Map(users.map((u) => [String(u._id), u.name]));
  const countById = new Map(counts.map((c) => [String(c._id), c.n]));
  const reportById = new Map(reports.map((c) => [String(c._id), c.n]));

  const items = convs.map((c) => ({
    id: String(c._id),
    participants: c.participants.map((p) => ({ id: String(p), name: userById.get(String(p)) || "Deleted user" })),
    messages: countById.get(String(c._id)) || 0,
    lastMessage: c.lastMessage?.text || "",
    lastAt: c.lastMessageAt,
    locked: !!c.locked,
    openReports: reportById.get(String(c._id)) || 0,
  }));
  return ok({ items, pagination: pagination(page, limit, total) }, "Chats fetched");
});
