import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { findPostOr404, setAction } from "@/lib/posts";
import { parseId } from "@/lib/validators/common";

export const dynamic = "force-dynamic";

// PUT = Save Post, DELETE = সেভ সরানো
const handler = (on) =>
  withApi(async (req, { params }) => {
    const me = await requireAuth(req);
    const id = parseId(params.id, "post id");
    await connectDB();
    await findPostOr404(id);
    await setAction(id, me._id, "save", on);
    return ok({ isSaved: on }, on ? "Post saved" : "Removed from saved");
  });
export const PUT = handler(true);
export const DELETE = handler(false);
