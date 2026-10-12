import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { loginSchema } from "@/lib/validators/auth";
import { setAuthCookie, signToken } from "@/lib/auth";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// user না পাওয়া গেলেও bcrypt চালানো হয়, যাতে response-time দেখে account আছে কিনা বোঝা না যায়
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

export const POST = withApi(async (req) => {
  const { identifier, password } = await parseBody(req, loginSchema);
  await connectDB();

  const query = identifier.includes("@") ? { email: identifier } : { phone: identifier };
  const user = await User.findOne(query).select("+passwordHash");
  const valid = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH);

  if (!user || !valid) throw new ApiError(401, "Invalid mobile number/email or password");
  if (user.status === "Blocked") throw new ApiError(403, "Your account has been blocked. Please contact support");

  setAuthCookie(await signToken(user));
  return ok({ user }, "Login successful");
});
