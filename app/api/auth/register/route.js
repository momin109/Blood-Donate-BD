import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { registerSchema } from "@/lib/validators/auth";
import { setAuthCookie, signToken } from "@/lib/auth";
import { nextSeq } from "@/models/Counter";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export const POST = withApi(async (req) => {
  // শুধু schema-র field গুলো থাকে (role/status ইত্যাদি client থেকে নেওয়া হয় না)
  const { confirmPassword, terms, password, ...input } = await parseBody(req, registerSchema);
  await connectDB();

  if (await User.exists({ phone: input.phone })) {
    throw new ApiError(409, "This mobile number is already registered", [
      { field: "phone", message: "This mobile number is already registered" },
    ]);
  }

  const user = await User.create({
    ...input,
    passwordHash: await bcrypt.hash(password, 12),
    donorId: `BD-${String(await nextSeq("donorId")).padStart(5, "0")}`,
  });

  setAuthCookie(await signToken(user));
  return ok({ user }, "Registration successful", 201);
});
