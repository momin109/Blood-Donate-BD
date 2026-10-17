import mongoose from "mongoose";

// Next.js dev-mode hot reload-এ বারবার নতুন connection না খুলতে global cache ব্যবহার করা হয়েছে।
const cache = global._mongoose || (global._mongoose = { conn: null, promise: null });

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.");
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 8000 });
  }
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null; // পরের request-এ আবার চেষ্টা করতে পারবে
    throw err;
  }
  return cache.conn;
}
