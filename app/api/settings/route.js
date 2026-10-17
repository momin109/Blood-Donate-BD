import { connectDB } from "@/lib/db";
import { ok, withApi } from "@/lib/api";
import { getGeneralSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// সাইটের সাধারণ তথ্য (নাম, সাপোর্ট ইমেইল/ফোন) — সবার জন্য খোলা
export const GET = withApi(async () => {
  await connectDB();
  return ok({ settings: await getGeneralSettings() }, "Settings fetched");
});
