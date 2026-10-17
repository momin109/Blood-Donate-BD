import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { pagination, parseQuery } from "@/lib/query";
import { adminChatReportsQuery } from "@/lib/validators/chat";
import ChatReport from "@/models/ChatReport";
import Conversation from "@/models/Conversation";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// ব্যবহারকারীদের রিপোর্ট করা chat: ?status=Open|Resolved|Dismissed
export const GET = withApi(async (req) => {
  await requireAdmin(req);
  const { status, page, limit } = parseQuery(req, adminChatReportsQuery);
  await connectDB();
  const where = status ? { status } : {};
  const [total, docs] = await Promise.all([
    ChatReport.countDocuments(where),
    ChatReport.find(where).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  const [users, convs] = await Promise.all([
    User.find({ _id: { $in: docs.flatMap((d) => [d.reporter, d.reportedUser]) } }).select("name").lean(),
    Conversation.find({ _id: { $in: docs.map((d) => d.conversation) } }).select("locked lastMessage").lean(),
  ]);
  const nameById = new Map(users.map((u) => [String(u._id), u.name]));
  const convById = new Map(convs.map((c) => [String(c._id), c]));
  const items = docs.map((d) => {
    const c = convById.get(String(d.conversation));
    return {
      id: String(d._id),
      conversationId: String(d.conversation),
      reason: d.reason,
      status: d.status || "Open",
      by: nameById.get(String(d.reporter)) || "Deleted user",
      reported: nameById.get(String(d.reportedUser)) || "Deleted user",
      lastMessage: c?.lastMessage?.text || "",
      locked: !!c?.locked,
      createdAt: d.createdAt,
    };
  });
  return ok({ items, pagination: pagination(page, limit, total) }, "Chat reports fetched");
});
