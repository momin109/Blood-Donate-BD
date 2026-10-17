import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { findPostOr404, setAction } from "@/lib/posts";
import { parseId } from "@/lib/validators/common";

export const dynamic = "force-dynamic";

// Share গোনা — একজন user একবারই গোনা হয়
export const POST = withApi(async (req, { params }) => {
  const me = await requireAuth(req);
  const id = parseId(params.id, "post id");
  await connectDB();
  await findPostOr404(id);
  const shares = await setAction(id, me._id, "share", true, { counter: "shares" });
  return ok({ shares }, "Share counted");
});
