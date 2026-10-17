import { z } from "zod";
import { MAX_POST_IMAGES, POST_KINDS } from "@/lib/constants";
import { emptyToUndef, objectId } from "@/lib/validators/common";

const pageNum = (name, max, def) =>
  emptyToUndef(z.coerce.number({ invalid_type_error: `${name} must be a number` }).int().min(1).max(max)).transform((v) => v ?? def);

const text = (max) => z.string({ invalid_type_error: "Text must be a string" }).trim().max(max, `Text must be at most ${max} characters`);

// POST /api/posts  (kind "request" ক্লায়েন্ট বানাতে পারে না — /api/requests থেকে আসে)
export const postCreateSchema = z
  .object({
    kind: z.enum(["donate", "general"], { errorMap: () => ({ message: "Invalid post type" }) }).default("general"),
    text: text(2000).default(""),
    images: z.array(objectId("image id")).max(MAX_POST_IMAGES, `You can add at most ${MAX_POST_IMAGES} photos`).default([]),
  })
  .refine((d) => d.text.length > 0 || d.images.length > 0, { path: ["text"], message: "Write something or add a photo" });

export const postUpdateSchema = z.object({ text: text(2000) });

export const commentSchema = z.object({
  text: z.string({ required_error: "Comment is required" }).trim().min(1, "Comment is required").max(500, "Comment must be at most 500 characters"),
});

export const reportSchema = z.object({
  reason: z.string({ required_error: "Please tell us the reason" }).trim().min(3, "Please tell us the reason").max(300, "Reason must be at most 300 characters"),
});

// GET /api/posts?page=&limit=&author=&kind=&saved=
export const postQuerySchema = z.object({
  author: emptyToUndef(objectId("author")),
  kind: emptyToUndef(z.enum(POST_KINDS, { errorMap: () => ({ message: "Invalid post type" }) })),
  saved: emptyToUndef(z.enum(["true", "false"], { errorMap: () => ({ message: "saved must be true or false" }) }).transform((v) => v === "true")),
  page: pageNum("page", 100000, 1),
  limit: pageNum("limit", 30, 10),
});

export const commentQuerySchema = z.object({ page: pageNum("page", 100000, 1), limit: pageNum("limit", 50, 20) });
