import { connectDB } from "@/lib/db";
import { ok, parseBody, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { getGeneralSettings } from "@/lib/settings";
import { settingsSchema } from "@/lib/validators/admin";
import Setting from "@/models/Setting";

export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  await requireAdmin(req);
  await connectDB();
  return ok({ settings: await getGeneralSettings() }, "Settings fetched");
});

export const PUT = withApi(async (req) => {
  await requireAdmin(req);
  const value = await parseBody(req, settingsSchema);
  await connectDB();
  await Setting.updateOne({ key: "general" }, { $set: { value } }, { upsert: true });
  return ok({ settings: await getGeneralSettings() }, "Settings saved");
});
