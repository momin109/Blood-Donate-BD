import { ok, withApi } from "@/lib/api";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req);
  return ok({ user });
});
