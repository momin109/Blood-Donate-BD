import mongoose from "mongoose";
import { POST_ACTIONS, REPORT_STATUSES } from "@/lib/constants";

// like / save / share / report — একজন user একটি post-এ প্রতিটি action একবারই করতে পারে
const postActionSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: POST_ACTIONS, required: true },
    status: { type: String, enum: REPORT_STATUSES, default: "Open" }, // শুধু report-এর জন্য
    reason: { type: String, trim: true, maxlength: 300 }, // শুধু report-এর জন্য (পরে Admin panel থেকে দেখা যাবে)
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
postActionSchema.index({ post: 1, user: 1, type: 1 }, { unique: true });
postActionSchema.index({ user: 1, type: 1, createdAt: -1 });
postActionSchema.index({ type: 1, status: 1, createdAt: -1 });

export default mongoose.models.PostAction || mongoose.model("PostAction", postActionSchema);
