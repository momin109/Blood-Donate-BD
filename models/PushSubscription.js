import mongoose from "mongoose";

// প্রতিটি browser/device-এর Push subscription। endpoint unique — একই browser আবার subscribe করলে আপডেট হয়।
const pushSubscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    endpoint: { type: String, required: true, unique: true, maxlength: 1000 },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

export default mongoose.models.PushSubscription || mongoose.model("PushSubscription", pushSubscriptionSchema);
