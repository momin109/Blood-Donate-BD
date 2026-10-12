import mongoose from "mongoose";
import { BLOOD_GROUPS, REQUEST_REASONS, REQUEST_STATUSES, URGENCIES } from "@/lib/constants";

const bloodRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    patientName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    age: { type: Number, required: true, min: 0, max: 120 },
    bloodGroup: { type: String, required: true, enum: BLOOD_GROUPS },
    bags: { type: Number, required: true, min: 1, max: 10 },
    hemoglobin: { type: Number, min: 1, max: 25 },
    hospital: { type: String, required: true, trim: true, maxlength: 150 },
    division: { type: String, required: true, trim: true, maxlength: 60 },
    district: { type: String, required: true, trim: true, maxlength: 60 },
    upazila: { type: String, required: true, trim: true, maxlength: 60 },
    contactPhone: { type: String, required: true, trim: true },
    urgency: { type: String, enum: URGENCIES, default: "Urgent" },
    neededAt: { type: Date, required: true },
    reason: { type: String, required: true, enum: REQUEST_REASONS },
    details: { type: String, trim: true, maxlength: 1000 },
    status: { type: String, enum: REQUEST_STATUSES, default: "Approved" },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_d, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
bloodRequestSchema.index({ status: 1, bloodGroup: 1, district: 1, createdAt: -1 });

export default mongoose.models.BloodRequest || mongoose.model("BloodRequest", bloodRequestSchema);
