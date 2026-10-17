import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { syncRequestWithPost } from "@/lib/admin";
import { parseId } from "@/lib/validators/common";
import { adminReportAction } from "@/lib/validators/admin";
import Post from "@/models/Post";
import PostAction from "@/models/PostAction";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// dismiss = অভিযোগ বাতিল | warn = লেখককে সতর্কবার্তা গোনা | remove = পোস্ট লুকিয়ে ফেলা (Rejected) ও এই পোস্টের সব report Resolved
export const PATCH = withApi(async (req, { params }) => {
  await requireAdmin(req);
  const id = parseId(params.id, "report id");
  const { action } = await parseBody(req, adminReportAction);
  await connectDB();
  const report = await PostAction.findOne({ _id: id, type: "report" });
  if (!report) throw new ApiError(404, "Report not found");

  if (action === "dismiss") {
    report.status = "Dismissed";
    await report.save();
  } else {
    const post = await Post.findById(report.post);
    if (action === "warn") {
      if (post) await User.updateOne({ _id: post.author }, { $inc: { warnings: 1 } });
      report.status = "Resolved";
      await report.save();
    } else {
      if (post) {
        post.status = "Rejected";
        await post.save();
        await syncRequestWithPost(post);
      }
      await PostAction.updateMany({ post: report.post, type: "report" }, { status: "Resolved" });
    }
  }
  return ok({ id, action }, "Report updated");
});
