import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { getMyConversation, otherParticipant } from "@/lib/chat";
import { parseId } from "@/lib/validators/common";
import { chatReportSchema } from "@/lib/validators/chat";
import ChatReport from "@/models/ChatReport";

export const dynamic = "force-dynamic";

// Conversation রিপোর্ট। শুধু participant করতে পারে; Admin → Chats → Reported Chats-এ দেখা যায়
export const POST = withApi(async (req, { params }) => {
  const me = await requireAuth(req);
  const id = parseId(params.id, "conversation id");
  const { reason } = await parseBody(req, chatReportSchema);
  await connectDB();
  const conv = await getMyConversation(id, me);
  if (await ChatReport.exists({ conversation: conv._id, reporter: me._id, status: "Open" })) {
    throw new ApiError(409, "You have already reported this conversation");
  }
  await ChatReport.create({ conversation: conv._id, reporter: me._id, reportedUser: otherParticipant(conv, me._id), reason });
  return ok(null, "Conversation reported. Thank you", 201);
});
