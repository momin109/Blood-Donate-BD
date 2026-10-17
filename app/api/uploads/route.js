import { connectDB } from "@/lib/db";
import { ApiError, ok, withApi } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { IMAGE_MAX_BYTES } from "@/lib/constants";
import { sniffImageType } from "@/lib/posts";
import { imageUrl } from "@/lib/serializers";
import Image from "@/models/Image";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_PENDING = 30; // ব্যবহার না হওয়া ছবি জমে সার্ভার ভরে যাওয়া ঠেকাতে

// multipart/form-data: file=<ছবি>, purpose=avatar|post  →  { id, url }
export const POST = withApi(async (req) => {
  const me = await requireAuth(req);

  let form;
  try {
    form = await req.formData();
  } catch {
    throw new ApiError(400, "Invalid upload. Send the image as multipart/form-data");
  }
  const file = form.get("file");
  const purpose = form.get("purpose") === "avatar" ? "avatar" : "post";
  if (!file || typeof file === "string" || !file.size) {
    throw new ApiError(400, "No image selected", [{ field: "file", message: "Choose an image to upload" }]);
  }
  const max = IMAGE_MAX_BYTES[purpose];
  if (file.size > max) {
    throw new ApiError(413, `Image is too large (max ${max / 1024 / 1024} MB)`, [{ field: "file", message: `Max ${max / 1024 / 1024} MB` }]);
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const contentType = sniffImageType(buf);
  if (!contentType) {
    throw new ApiError(415, "Only JPG, PNG, WebP or GIF images are allowed", [{ field: "file", message: "Unsupported image type" }]);
  }

  await connectDB();
  if ((await Image.countDocuments({ owner: me._id, attached: false })) >= MAX_PENDING) {
    throw new ApiError(429, "Too many unused uploads. Please try again later");
  }
  const img = await Image.create({ owner: me._id, purpose, contentType, size: buf.length, data: buf });
  return ok({ id: String(img._id), url: imageUrl(img._id) }, "Image uploaded", 201);
});
