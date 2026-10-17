import { connectDB } from "@/lib/db";
import { ok, parseBody, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { adCreate } from "@/lib/validators/admin";
import Ad from "@/models/Ad";

export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  await requireAdmin(req);
  await connectDB();
  const ads = await Ad.find().sort({ createdAt: -1 });
  return ok({ items: ads }, "Ads fetched");
});

export const POST = withApi(async (req) => {
  await requireAdmin(req);
  const input = await parseBody(req, adCreate);
  await connectDB();
  const ad = await Ad.create({ ...input, start: input.start ? new Date(input.start) : undefined, end: input.end ? new Date(input.end) : undefined });
  return ok({ ad }, "Ad created", 201);
});
