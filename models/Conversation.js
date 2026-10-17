import mongoose from "mongoose";

// দুইজন user-এর মধ্যে একটিই conversation থাকে। participantKey = দুই id sort করে "a_b" (unique)
const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: [(v) => v.length === 2, "A conversation needs exactly 2 participants"],
    },
    participantKey: { type: String, required: true, unique: true },
    // list-এ দ্রুত দেখানোর জন্য শেষ মেসেজ (denormalized)
    lastMessage: {
      text: { type: String },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      at: { type: Date },
    },
    lastMessageAt: { type: Date },
    // কে কখন পর্যন্ত পড়েছে: { "<userId>": Date } — unread সংখ্যা এখান থেকে হিসাব হয়
    lastRead: { type: Map, of: Date, default: {} },
    // Admin lock করলে নতুন মেসেজ পাঠানো যায় না (পুরনো মেসেজ দেখা যায়)
    locked: { type: Boolean, default: false },
  },
  { timestamps: true }
);
conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ lastMessageAt: -1 });

export default mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
