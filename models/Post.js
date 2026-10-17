import mongoose from "mongoose";
import { POST_KINDS, POST_STATUSES } from "@/lib/constants";

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    kind: { type: String, enum: POST_KINDS, default: "general" },
    text: { type: String, trim: true, maxlength: 2000, default: "" },
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
    // Admin moderation: Pending/Rejected পোস্ট feed-এ দেখায় না
    status: { type: String, enum: POST_STATUSES, default: "Approved" },
    // kind === "request" হলে সংশ্লিষ্ট BloodRequest
    request: { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest", index: true, sparse: true },
    // দ্রুত দেখানোর জন্য denormalized counter
    likes: { type: Number, default: 0, min: 0 },
    comments: { type: Number, default: 0, min: 0 },
    shares: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

export default mongoose.models.Post || mongoose.model("Post", postSchema);
