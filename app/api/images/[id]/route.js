import { connectDB } from "@/lib/db";
import { ApiError, withApi } from "@/lib/api";
import { parseId } from "@/lib/validators/common";
import Image from "@/models/Image";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ছবি সবার জন্য খোলা (profile ও post-এর ছবি)। id অনুমান করা যায় না, আর ছবি কখনো বদলায় না — তাই লম্বা cache।
export const GET = withApi(async (_req, { params }) => {
  const id = parseId(params.id, "image id");
  await connectDB();
  const img = await Image.findById(id).select("+data contentType");
  if (!img) throw new ApiError(404, "Image not found");
  return new Response(img.data, {
    headers: {
      "Content-Type": img.contentType,
      "Content-Length": String(img.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
});
