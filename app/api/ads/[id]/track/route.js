import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { parseId } from "@/lib/validators/common";
import { adTrackSchema } from "@/lib/validators/admin";
import Ad from "@/models/Ad";

export const dynamic = "force-dynamic";

// বিজ্ঞাপন দেখা (impression) ও ক্লিক গোনা
export const POST = withApi(async (req, { params }) => {
  const id = parseId(params.id, "ad id");
  const { type } = await parseBody(req, adTrackSchema);
  await connectDB();
  const r = await Ad.updateOne({ _id: id }, { $inc: { [type === "click" ? "clicks" : "impressions"]: 1 } });
  if (!r.matchedCount) throw new ApiError(404, "Ad not found");
  return ok(null, "Tracked");
});
