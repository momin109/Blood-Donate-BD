import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
// একই donor দুইবার favorite করা যাবে না
favoriteSchema.index({ user: 1, donor: 1 }, { unique: true });

export default mongoose.models.Favorite || mongoose.model("Favorite", favoriteSchema);
