import { api } from "@/lib/client";

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

// আপলোডের আগে ছবি ছোট করা (মোবাইলের বড় ছবি দ্রুত ও কম ডেটায় যায়)। square=true হলে মাঝখান থেকে বর্গাকার কাটে।
export async function compressImage(file, { maxDim = 1600, quality = 0.85, square = false } = {}) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file; // GIF-এর animation নষ্ট না করতে
  try {
    const bmp = await createImageBitmap(file);
    let sx = 0, sy = 0, sw = bmp.width, sh = bmp.height;
    if (square) {
      const m = Math.min(sw, sh);
      sx = (sw - m) / 2;
      sy = (sh - m) / 2;
      sw = sh = m;
    }
    const scale = Math.min(1, maxDim / Math.max(sw, sh));
    const w = Math.max(1, Math.round(sw * scale));
    const h = Math.max(1, Math.round(sh * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(bmp, sx, sy, sw, sh, 0, 0, w, h);
    bmp.close?.();
    const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (!blob || (!square && scale === 1 && blob.size >= file.size)) return file;
    return new File([blob], "image.jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

// POST /api/uploads → { id, url }
export async function uploadImage(file, purpose = "post") {
  const f = await compressImage(file, purpose === "avatar" ? { maxDim: 640, square: true } : { maxDim: 1600 });
  const fd = new FormData();
  fd.append("file", f);
  fd.append("purpose", purpose);
  return api("/api/uploads", { method: "POST", body: fd });
}
