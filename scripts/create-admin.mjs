// প্রথম Admin তৈরি (বা বিদ্যমান account-কে admin বানানো):
//   npm run create-admin -- admin@blooddonatebd.com 'StrongPass123' "Admin"
// .env.local থেকে MONGODB_URI নেয়।
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const [email, password, name = "Admin"] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: npm run create-admin -- <email> <password> [name]");
  process.exit(1);
}
if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
  console.error("Password must be at least 8 characters with a letter and a number");
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set (create .env.local first)");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
const users = mongoose.connection.collection("users");
const passwordHash = await bcrypt.hash(password, 12);
const now = new Date();
const e = email.toLowerCase().trim();
const res = await users.updateOne(
  { email: e },
  { $set: { name, passwordHash, role: "admin", status: "Active", updatedAt: now }, $setOnInsert: { email: e, available: false, donationCount: 0, createdAt: now } },
  { upsert: true }
);
console.log(res.upsertedCount ? `Admin created: ${e}` : `Existing account updated to admin: ${e}`);
await mongoose.disconnect();
