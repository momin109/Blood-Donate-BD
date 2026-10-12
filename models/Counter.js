import mongoose from "mongoose";

// Atomic auto-increment counter (donorId ইত্যাদির জন্য)
const counterSchema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } });

const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);
export default Counter;

export async function nextSeq(name) {
  const doc = await Counter.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return doc.seq;
}
