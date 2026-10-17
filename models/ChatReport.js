import mongoose from "mongoose";
import { REPORT_STATUSES } from "@/lib/constants";

// কোনো user একটি conversation রিপোর্ট করলে এখানে জমা হয়; Admin → Chats → Reported Chats থেকে দেখা যায়
const chatReportSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true, trim: true, maxlength: 300 },
    status: { type: String, enum: REPORT_STATUSES, default: "Open" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
chatReportSchema.index({ status: 1, createdAt: -1 });
chatReportSchema.index({ conversation: 1, reporter: 1, status: 1 });

export default mongoose.models.ChatReport || mongoose.model("ChatReport", chatReportSchema);
