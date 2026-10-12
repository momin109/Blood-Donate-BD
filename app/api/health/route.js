import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";

export const dynamic = "force-dynamic";

export const GET = withApi(async () => {
  await connectDB();
  return ok({ status: "up", db: "connected" }, "API is healthy");
});
