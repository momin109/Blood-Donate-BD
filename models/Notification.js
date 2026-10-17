import mongoose from "mongoose";

// Admin-এর পাঠানো Notification। "all" হলে সবাই দেখে; "selected" হলে শুধু recipients-এর user।
// কে পড়েছে তা এখানে রাখা হয় না — User.notificationsSeenAt দিয়ে unread গোনা হয় (বড় array এড়াতে)।
const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    message: { type: String, required: true, trim: true, minlength: 2, maxlength: 500 },
    image: { type: mongoose.Schema.Types.ObjectId, ref: "Image" }, // Image collection (purpose: "post")
    url: { type: String, trim: true, maxlength: 500, default: "" }, // ক্লিক করলে যে page খুলবে ("/requests" বা https://…)
    audience: { type: String, enum: ["all", "selected"], default: "all" },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // শুধু audience = "selected" হলে
    recipientCount: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Push ফলাফল (Admin history-তে দেখানোর জন্য)
    pushTargeted: { type: Number, default: 0, min: 0 },
    pushSent: { type: Number, default: 0, min: 0 },
    pushFailed: { type: Number, default: 0, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ audience: 1, createdAt: -1 });
notificationSchema.index({ recipients: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
