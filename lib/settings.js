import Setting from "@/models/Setting";

export const DEFAULT_SETTINGS = {
  siteName: "Blood Donate BD",
  supportEmail: "support@blooddonatebd.com",
  supportPhone: "+880 1700-000000",
  siteUrl: "www.blooddonatebd.com",
};

export async function getGeneralSettings() {
  const doc = await Setting.findOne({ key: "general" }).lean();
  return { ...DEFAULT_SETTINGS, ...(doc?.value || {}) };
}
