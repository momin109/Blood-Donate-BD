import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { adminAccountSchema } from "@/lib/validators/admin";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// Admin নিজের নাম, ইমেইল ও পাসওয়ার্ড বদলায় (পাসওয়ার্ড বদলাতে বর্তমান পাসওয়ার্ড লাগে)
export const PATCH = withApi(async (req) => {
  const me = await requireAdmin(req);
  const { name, email, currentPassword, newPassword } = await parseBody(req, adminAccountSchema);
  await connectDB();
  const admin = await User.findById(me._id).select("+passwordHash");

  if (newPassword) {
    if (!(await bcrypt.compare(currentPassword, admin.passwordHash))) {
      throw new ApiError(400, "Validation failed", [{ field: "currentPassword", message: "Current password is incorrect" }]);
    }
    admin.passwordHash = await bcrypt.hash(newPassword, 12);
  }
  if (name) admin.name = name;
  if (email) admin.email = email;
  await admin.save();
  return ok({ user: admin }, "Account updated");
});
