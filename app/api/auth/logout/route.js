import { ok, withApi } from "@/lib/api";
import { clearAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const POST = withApi(async () => {
  clearAuthCookie();
  return ok(null, "Logged out");
});
