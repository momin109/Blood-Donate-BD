import { timingSafeEqual } from "crypto";
import { connectDB } from "@/lib/db";
import { ApiError, ok, withApi } from "@/lib/api";
import { recomputeRanking } from "@/lib/ranking";

export const dynamic = "force-dynamic";

// প্রতি রাত ১২টায় র‍্যাংকিং আপডেট। header: Authorization: Bearer <CRON_SECRET>
//  - custom server (server.js) চললে নিজেই রাত ১২টায় (Asia/Dhaka) এটি ডাকে
//  - নইলে বাইরের cron (cron-job.org / Vercel Cron / crontab) থেকে GET বা POST করুন
async function run(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new ApiError(503, "CRON_SECRET is not configured");
  const got = Buffer.from(req.headers.get("authorization") || "");
  const want = Buffer.from(`Bearer ${secret}`);
  if (got.length !== want.length || !timingSafeEqual(got, want)) throw new ApiError(401, "Unauthorized");
  await connectDB();
  return ok(await recomputeRanking(), "Ranking updated");
}
export const GET = withApi(run);
export const POST = withApi(run);
