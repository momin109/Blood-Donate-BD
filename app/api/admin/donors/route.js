import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { ApiError, ok, parseBody, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { adminDonor } from "@/lib/admin";
import { escapeRegex, pagination, parseQuery } from "@/lib/query";
import { adminDonorCreate, adminDonorsQuery } from "@/lib/validators/admin";
import { nextSeq } from "@/models/Counter";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// সব donor (Blocked/Pending সহ): ?q= (নাম/ID/ফোন) &bloodGroup= &status= &page= &limit=
export const GET = withApi(async (req) => {
  await requireAdmin(req);
  const { q, bloodGroup, status, page, limit } = parseQuery(req, adminDonorsQuery);
  await connectDB();
  const filter = { role: "user" };
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (status) filter.status = status;
  if (q) {
    const re = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ name: re }, { donorId: re }, { phone: re }];
  }
  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  return ok({ items: users.map(adminDonor), pagination: pagination(page, limit, total) }, "Donors fetched");
});

// Admin নতুন donor যোগ করে
export const POST = withApi(async (req) => {
  await requireAdmin(req);
  const { password, ...input } = await parseBody(req, adminDonorCreate);
  await connectDB();
  if (await User.exists({ phone: input.phone })) {
    throw new ApiError(409, "This mobile number is already registered", [{ field: "phone", message: "This mobile number is already registered" }]);
  }
  const user = await User.create({
    ...input,
    lastDonationDate: input.lastDonationDate ? new Date(input.lastDonationDate) : undefined,
    passwordHash: await bcrypt.hash(password, 12),
    donorId: `BD-${String(await nextSeq("donorId")).padStart(5, "0")}`,
  });
  return ok({ donor: adminDonor(user) }, "Donor added", 201);
});
