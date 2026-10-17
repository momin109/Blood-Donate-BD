import mongoose from "mongoose";
import { BADGE_TYPES, BLOOD_GROUPS, ROLES, USER_STATUSES } from "@/lib/constants";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    phone: { type: String, trim: true, unique: true, sparse: true },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    passwordHash: { type: String, required: true, select: false },
    bloodGroup: { type: String, enum: BLOOD_GROUPS },
    division: { type: String, trim: true, maxlength: 60 },
    district: { type: String, trim: true, maxlength: 60 },
    upazila: { type: String, trim: true, maxlength: 60 },
    area: { type: String, trim: true, maxlength: 120 },
    photo: { type: mongoose.Schema.Types.ObjectId, ref: "Image" }, // profile ছবি (Image collection)
    lastDonationDate: { type: Date },
    donationCount: { type: Number, default: 0, min: 0 },
    available: { type: Boolean, default: true },
    donorId: { type: String, unique: true, sparse: true },
    warnings: { type: Number, default: 0, min: 0 }, // Admin-এর সতর্কবার্তা সংখ্যা
    // Top Donor ranking (lib/ranking.js প্রতিবার হিসাব করে লেখে; হাতে বদলানোর দরকার নেই)
    donorScore: { type: Number, default: 0, min: 0 },
    rankDonations: { type: Number, default: 0, min: 0 }, // র‍্যাংকে গোনা অনুমোদিত রক্তদান
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    donorRank: { type: Number, default: 0, min: 0 }, // ০ = র‍্যাংকে নেই
    badgeType: { type: String, enum: BADGE_TYPES, default: "none" },
    nidVerified: { type: Boolean, default: false }, // Admin যাচাই করে (+30 পয়েন্ট, দুটোই হলে)
    phoneVerified: { type: Boolean, default: false },
    notificationsSeenAt: { type: Date }, // Notification bell সর্বশেষ কখন দেখা হয়েছে (এর পরের গুলো unread)
    role: { type: String, enum: ROLES, default: "user" },
    status: { type: String, enum: USER_STATUSES, default: "Active" },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        ret.photo = ret.photo ? `/api/images/${ret.photo}` : null;
        return ret;
      },
    },
  }
);

// Donor list-এর filter query দ্রুত করার জন্য
userSchema.index({ role: 1, status: 1, bloodGroup: 1, district: 1, available: 1 });
userSchema.index({ badgeType: 1, donorRank: 1 }); // leaderboard

export default mongoose.models.User || mongoose.model("User", userSchema);
