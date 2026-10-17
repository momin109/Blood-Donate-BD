import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { parseId } from "@/lib/validators/common";
import { adminChatReportAction } from "@/lib/validators/chat";
import { emitConversationUpdated } from "@/lib/realtime";
import ChatReport from "@/models/ChatReport";
import Conversation from "@/models/Conversation";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// dismiss = অভিযোগ বাতিল | warn = অভিযুক্তকে সতর্কবার্তা গোনা (Resolved)
// lock = conversation বন্ধ করা ও এই conversation-এর সব Open report Resolved
export const PATCH = withApi(async (req, { params }) => {
  await requireAdmin(req);
  const id = parseId(params.id, "report id");
  const { action } = await parseBody(req, adminChatReportAction);
  await connectDB();
  const report = await ChatReport.findById(id);
  if (!report) throw new ApiError(404, "Report not found");

  if (action === "dismiss") {
    report.status = "Dismissed";
    await report.save();
  } else if (action === "warn") {
    await User.updateOne({ _id: report.reportedUser }, { $inc: { warnings: 1 } });
    report.status = "Resolved";
    await report.save();
  } else {
    const conv = await Conversation.findById(report.conversation).select("participants").lean();
    await Conversation.updateOne({ _id: report.conversation }, { $set: { locked: true } });
    if (conv) emitConversationUpdated(conv);
    await ChatReport.updateMany({ conversation: report.conversation, status: "Open" }, { status: "Resolved" });
  }
  return ok({ id, action }, "Report updated");
});
