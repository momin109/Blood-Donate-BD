import { connectDB } from "@/lib/db";
import { ApiError, ok, withApi } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { findPostOr404 } from "@/lib/posts";
import { parseId } from "@/lib/validators/common";
import Comment from "@/models/Comment";
import Post from "@/models/Post";

export const dynamic = "force-dynamic";

// কমেন্টকারী অথবা পোস্টের মালিক মুছতে পারে
export const DELETE = withApi(async (req, { params }) => {
  const me = await requireAuth(req);
  const postId = parseId(params.id, "post id");
  const commentId = parseId(params.commentId, "comment id");
  await connectDB();

  const post = await findPostOr404(postId);
  const comment = await Comment.findOne({ _id: commentId, post: postId });
  if (!comment) throw new ApiError(404, "Comment not found");
  if (String(comment.author) !== String(me._id) && String(post.author) !== String(me._id)) {
    throw new ApiError(403, "You cannot delete this comment");
  }
  await comment.deleteOne();
  const updated = await Post.findByIdAndUpdate(postId, { $inc: { comments: -1 } }, { new: true }).select("comments").lean();
  return ok({ comments: Math.max(0, updated?.comments ?? 0) }, "Comment deleted");
});
