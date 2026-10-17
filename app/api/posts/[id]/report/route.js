import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { findPostOr404, setAction } from "@/lib/posts";
import { parseId } from "@/lib/validators/common";
import { reportSchema } from "@/lib/validators/post";

export const dynamic = "force-dynamic";

// পোস্ট রিপোর্ট। DB-তে জমা থাকে; Admin panel পরে এখান থেকে পড়বে
export const POST = withApi(async (req, { params }) => {
  const me = await requireAuth(req);
  const id = parseId(params.id, "post id");
  const { reason } = await parseBody(req, reportSchema);
  await connectDB();
  const post = await findPostOr404(id);
  if (String(post.author) === String(me._id)) throw new ApiError(400, "You cannot report your own post");
  await setAction(id, me._id, "report", true, { reason });
  return ok(null, "Post reported. Thank you");
});
