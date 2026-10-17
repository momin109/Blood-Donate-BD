import mongoose from "mongoose";
import { AD_TONES } from "@/lib/constants";

// Feed-এ দেখানো বিজ্ঞাপন (Admin → Advertisements থেকে নিয়ন্ত্রিত)
const adSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    text: { type: String, trim: true, maxlength: 200, default: "" },
    cta: { type: String, trim: true, maxlength: 30, default: "Learn More" },
    link: { type: String, required: true, trim: true, maxlength: 500 },
    every: { type: Number, min: 5, max: 7, default: 6 }, // প্রতি কতটি পোস্ট পরপর
    tone: { type: String, enum: Object.keys(AD_TONES), default: "brand" },
    active: { type: Boolean, default: true },
    start: { type: Date },
    end: { type: Date },
    impressions: { type: Number, default: 0, min: 0 },
    clicks: { type: Number, default: 0, min: 0 },
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

export default mongoose.models.Ad || mongoose.model("Ad", adSchema);
