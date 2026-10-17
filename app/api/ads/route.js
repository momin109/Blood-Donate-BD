import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";
import Ad from "@/models/Ad";

export const dynamic = "force-dynamic";

// Feed-এ দেখানোর জন্য এখন চালু বিজ্ঞাপন (Active এবং তারিখের মধ্যে) — সবার জন্য খোলা
export const GET = withApi(async () => {
  await connectDB();
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 3600 * 1000); // end তারিখের পুরো দিন চালু থাকে
  const ads = await Ad.find({
    active: true,
    $and: [{ $or: [{ start: null }, { start: { $exists: false } }, { start: { $lte: now } }] }, { $or: [{ end: null }, { end: { $exists: false } }, { end: { $gte: dayAgo } }] }],
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("title text cta link every tone");
  return ok({ items: ads }, "Ads fetched");
});
