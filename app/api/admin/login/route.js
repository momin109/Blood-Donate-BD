import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { setAuthCookie, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators/auth";
import User from "@/models/User";

export const dynamic = "force-dynamic";

const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

// Admin login (email + password)। admin না হলে cookie বসানো হয় না।
export const POST = withApi(async (req) => {
  const { identifier, password } = await parseBody(req, loginSchema);
  await connectDB();
  const user = await User.findOne(identifier.includes("@") ? { email: identifier } : { phone: identifier }).select("+passwordHash");
  const valid = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH);
  // admin কিনা জানিয়ে না দিতে সব ভুলে একই বার্তা
  if (!user || !valid || user.role !== "admin") throw new ApiError(401, "Invalid email or password");
  if (user.status === "Blocked") throw new ApiError(403, "This account has been blocked");
  setAuthCookie(await signToken(user));
  return ok({ user }, "Login successful");
});
