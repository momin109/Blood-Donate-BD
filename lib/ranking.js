import Donation from "@/models/Donation";
import User from "@/models/User";

// ---- স্কোরের নিয়ম (Top Donor Ranking spec) ----
// Total = (দান × 50) + (শেষ ৬ মাসের প্রতি দানে +20) + (গড় rating × 10) + (প্রতি দানের Response bonus) + (NID ও Phone দুটোই verified হলে +30)
export const SCORE = {
  PER_DONATION: 50,
  RECENT_BONUS: 20,
  RECENT_DAYS: 180,
  RATING_MULTIPLIER: 10,
  RESPONDED_WITHIN_HOUR: 20,
  CALL_RECEIVED: 10,
  VERIFIED: 30,
};
export const HOSPITAL_GAP_DAYS = 90; // একই হাসপাতালে ৩ মাসের আগে আরেকটি দান গোনা হবে না
const DAY = 86400000;

export const hospitalKey = (s) => String(s).trim().toLowerCase().replace(/\s+/g, " ");

export const badgeForRank = (rank) => (rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : rank >= 4 && rank <= 10 ? "top10" : "none");

// একই donor-এর একই হাসপাতালে ±৩ মাসের মধ্যে অন্য দান আছে কিনা (Anti-Fake)
export function findHospitalConflict(donor, key, date, { statuses, excludeId } = {}) {
  const gap = HOSPITAL_GAP_DAYS * DAY;
  return Donation.findOne({
    donor,
    hospitalKey: key,
    status: { $in: statuses },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    donatedAt: { $gt: new Date(date.getTime() - gap), $lt: new Date(date.getTime() + gap) },
  })
    .select("donatedAt")
    .lean();
}

// একজন donor-এর অনুমোদিত donation গুলো থেকে স্কোর (pure function — আলাদাভাবে test করা যায়)
export function calcScore(donations, verified, now = new Date()) {
  const recentFrom = now.getTime() - SCORE.RECENT_DAYS * DAY;
  let score = donations.length * SCORE.PER_DONATION;
  let ratingSum = 0;
  let ratingCount = 0;
  for (const d of donations) {
    if (new Date(d.donatedAt).getTime() >= recentFrom) score += SCORE.RECENT_BONUS;
    if (d.respondedWithinHour) score += SCORE.RESPONDED_WITHIN_HOUR;
    if (d.callReceived) score += SCORE.CALL_RECEIVED;
    if (d.rating) {
      ratingSum += d.rating;
      ratingCount += 1;
    }
  }
  const avgRating = ratingCount ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0;
  score += Math.round(avgRating * SCORE.RATING_MULTIPLIER);
  if (verified) score += SCORE.VERIFIED;
  return { score, avgRating };
}

// সবার র‍্যাংক নতুন করে হিসাব করে User-এ লেখা। অন্তত ১টি অনুমোদিত দান + Active user হলেই র‍্যাংকে ঢোকে।
// ডাকা হয়: Admin donation অনুমোদন/বাতিলে, Admin "Recalculate" বাটনে, আর রাত ১২টার cron-এ (/api/cron/ranking)।
export async function recomputeRanking(now = new Date()) {
  const approved = await Donation.find({ status: "Approved" }).select("donor donatedAt respondedWithinHour callReceived rating").lean();
  const byDonor = new Map();
  for (const d of approved) {
    const k = String(d.donor);
    if (!byDonor.has(k)) byDonor.set(k, []);
    byDonor.get(k).push(d);
  }

  const users = await User.find({ _id: { $in: [...byDonor.keys()] }, role: "user", status: "Active" }).select("nidVerified phoneVerified").lean();
  const rows = users
    .map((u) => {
      const list = byDonor.get(String(u._id));
      return { id: u._id, count: list.length, ...calcScore(list, u.nidVerified && u.phoneVerified, now) };
    })
    // স্কোর সমান হলে বেশি দান আগে, তারপরও সমান হলে পুরনো সদস্য (id ছোট) আগে
    .sort((a, b) => b.score - a.score || b.count - a.count || String(a.id).localeCompare(String(b.id)));

  const ops = rows.map((r, i) => ({
    updateOne: {
      filter: { _id: r.id },
      update: { $set: { donorScore: r.score, rankDonations: r.count, avgRating: r.avgRating, donorRank: i + 1, badgeType: badgeForRank(i + 1) } },
    },
  }));
  if (ops.length) await User.bulkWrite(ops);

  // আগে র‍্যাংকে ছিল কিন্তু এখন নেই (দান বাতিল / Block / মোছা হয়নি) — রিসেট
  await User.updateMany(
    { _id: { $nin: rows.map((r) => r.id) }, $or: [{ donorRank: { $gt: 0 } }, { donorScore: { $gt: 0 } }, { badgeType: { $ne: "none" } }] },
    { $set: { donorScore: 0, rankDonations: 0, avgRating: 0, donorRank: 0, badgeType: "none" } }
  );
  return { ranked: rows.length, updatedAt: now.toISOString() };
}
