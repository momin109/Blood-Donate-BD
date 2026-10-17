import mongoose from "mongoose";
import { IMAGE_PURPOSES } from "@/lib/constants";

// আপলোড করা ছবি MongoDB-তেই সংরক্ষিত (বাইরের storage/সার্ভিস লাগে না)। GET /api/images/:id দিয়ে দেখানো হয়।
const imageSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    purpose: { type: String, enum: IMAGE_PURPOSES, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true, select: false },
    // profile/post-এ ব্যবহার হলে true। আপলোড করে ব্যবহার না করা ছবি ২৪ ঘণ্টা পর নিজে থেকে মুছে যায় (TTL)
    attached: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
imageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24, partialFilterExpression: { attached: false } });

export default mongoose.models.Image || mongoose.model("Image", imageSchema);
