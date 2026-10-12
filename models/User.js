import mongoose from "mongoose";
import { BLOOD_GROUPS, ROLES, USER_STATUSES } from "@/lib/constants";

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
    lastDonationDate: { type: Date },
    donationCount: { type: Number, default: 0, min: 0 },
    available: { type: Boolean, default: true },
    donorId: { type: String, unique: true, sparse: true },
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
        return ret;
      },
    },
  }
);

// Donor list-এর filter query দ্রুত করার জন্য
userSchema.index({ role: 1, status: 1, bloodGroup: 1, district: 1, available: 1 });

export default mongoose.models.User || mongoose.model("User", userSchema);
