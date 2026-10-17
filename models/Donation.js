import mongoose from "mongoose";
import { DONATION_STATUSES } from "@/lib/constants";

// একটি রক্তদানের রেকর্ড। Donor জমা দেয় (Pending) → Admin অনুমোদন করলে (Approved) র‍্যাংকিং স্কোরে গোনা হয়।
const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    hospital: { type: String, required: true, trim: true, maxlength: 150 },
    hospitalKey: { type: String, required: true }, // ছোট হাতের, বাড়তি space ছাড়া — একই হাসপাতাল চেনার জন্য
    donatedAt: { type: Date, required: true },
    status: { type: String, enum: DONATION_STATUSES, default: "Pending" },
    // Admin অনুমোদনের সময় যাচাই করে দেয়
    respondedWithinHour: { type: Boolean, default: false }, // ১ ঘণ্টার মধ্যে রিপ্লাই (+20)
    callReceived: { type: Boolean, default: false }, // কল রিসিভ করেছেন (+10)
    rating: { type: Number, min: 1, max: 5 }, // রিসিভারের দেওয়া star
    note: { type: String, trim: true, maxlength: 300 },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ donor: 1, hospitalKey: 1, donatedAt: -1 });

export default mongoose.models.Donation || mongoose.model("Donation", donationSchema);
