import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { findPostOr404, setAction } from "@/lib/posts";
import { parseId } from "@/lib/validators/common";

export const dynamic = "force-dynamic";

// PUT = like (idempotent), DELETE = unlike
const handler = (on) =>
  withApi(async (req, { params }) => {
    const me = await requireAuth(req);
    const id = parseId(params.id, "post id");
    await connectDB();
    await findPostOr404(id);
    const likes = await setAction(id, me._id, "like", on, { counter: "likes" });
    return ok({ isLiked: on, likes }, on ? "Liked" : "Like removed");
  });
export const PUT = handler(true);
export const DELETE = handler(false);
