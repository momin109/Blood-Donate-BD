import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
messageSchema.index({ conversation: 1, _id: -1 });
messageSchema.index({ sender: 1, createdAt: -1 }); // spam rate-limit check

export default mongoose.models.Message || mongoose.model("Message", messageSchema);
