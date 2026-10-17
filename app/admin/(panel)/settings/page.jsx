"use client";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import PasswordField from "@/components/PasswordField";
import { Button, Card, Field, Select, Switch } from "@/components/ui";
import { useAdmin } from "@/components/admin/AdminContext";
import { api } from "@/lib/client";

// onSave(FormData) async; সফল হলে সবুজ বার্তা, ব্যর্থ হলে লাল। form-এর field গুলো FormData-তে যায়।
function Section({ title, desc, children, onSave }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setMsg(null);
    try {
      const text = await onSave(new FormData(form));
      setMsg({ ok: true, text: text || "Saved" });
    } catch (err) {
      setMsg({ ok: false, text: err.errors?.length ? err.errors.map((x) => x.message).join(" · ") : err.message });
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card className="p-4 sm:p-6">
      <form onSubmit={submit}>
        <div className="mb-5">
          <p className="text-lg font-bold">{title}</p>
          {desc && <p className="text-sm text-ink-soft">{desc}</p>}
        </div>
        {children}
        {msg && <p role="status" className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-700" : "bg-brand-50 text-brand-700"}`}>{msg.text}</p>}
        <div className="mt-5 flex sm:justify-end">
          <Button type="submit" className="w-full sm:w-auto" disabled={busy}>
            <Save className="h-4 w-4" />
            {busy ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
const Row = ({ title, desc, on, set }) => (
  <div className="flex items-center gap-4 rounded-2xl bg-surface p-3.5">
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-ink-soft">{desc}</p>
    </div>
    <Switch on={on} onChange={set} />
  </div>
);

export default function AdminSettings() {
  const { admin, reload } = useAdmin();
  const [general, setGeneral] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [auto, setAuto] = useState(true);
  const [ads, setAds] = useState(true);
  const [mail, setMail] = useState(true);

  // GET /api/admin/settings
  useEffect(() => {
    api("/api/admin/settings").then((d) => setGeneral(d.settings)).catch((e) => setLoadError(e.message));
  }, []);

  // PUT /api/admin/settings
  const saveGeneral = async (f) => {
    const d = await api("/api/admin/settings", { method: "PUT", body: Object.fromEntries(f.entries()) });
    setGeneral(d.settings);
    return "Settings saved";
  };
  // PATCH /api/admin/account
  const saveAccount = async (f) => {
    const body = Object.fromEntries([...f.entries()].filter(([, v]) => v !== "")); // ফাঁকা ঘর পাঠানো হয় না
    await api("/api/admin/account", { method: "PATCH", body });
    reload();
    return "Account updated";
  };
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage website, moderation and account settings"
      />
      <div className="mx-auto max-w-3xl space-y-5">
        {loadError && <p role="alert" className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{loadError}</p>}
        {general && (
          <Section title="General" desc="Basic website information" onSave={saveGeneral}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="siteName" label="Website Name" defaultValue={general.siteName} />
              <Field name="supportEmail" label="Support Email" type="email" defaultValue={general.supportEmail} />
              <Field name="supportPhone" label="Support Phone" type="tel" defaultValue={general.supportPhone} />
              <Field name="siteUrl" label="Website URL" defaultValue={general.siteUrl} />
            </div>
          </Section>
        )}
        {/* <Section title="Post Moderation" desc="Auto-Approve rules (UI only)">
          <div className="space-y-3">
            <Row
              title="Auto-Approve Posts"
              desc="Publish posts instantly when automatic checks pass"
              on={auto}
              set={setAuto}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Minimum account age"
                options={["No minimum", "1 day", "7 days", "30 days"]}
                defaultValue="No minimum"
              />
              <Select
                label="Reports before auto-hide"
                options={["3 reports", "5 reports", "10 reports"]}
                defaultValue="5 reports"
              />
            </div>
            <Field
              as="textarea"
              rows={3}
              label="Blocked keywords"
              placeholder="Comma separated: spam, win prize, ..."
            />
          </div>
        </Section> */}
        {/* <Section title="Advertisements" desc="Feed ad frequency">
          <div className="space-y-3">
            <Row
              title="Show ads in feed"
              desc="Display sponsored cards between posts"
              on={ads}
              set={setAds}
            />
            <Select
              label="Show an ad after every"
              options={["5 posts", "6 posts", "7 posts"]}
              defaultValue="6 posts"
            />
          </div>
        </Section> */}
        {/* <Section title="Notifications">
          <Row
            title="Email me about new reports"
            desc="Get an email when a post is reported"
            on={mail}
            set={setMail}
          />
        </Section> */}
        <Section title="Admin Account" desc="Update your profile and password" onSave={saveAccount}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="name" label="Name" defaultValue={admin?.name} />
            <Field name="email" label="Email" type="email" defaultValue={admin?.email} />
            <PasswordField name="currentPassword" label="Current Password" autoComplete="current-password" />
            <div />
            <PasswordField name="newPassword" label="New Password" autoComplete="new-password" />
            <PasswordField name="confirmPassword" label="Confirm Password" autoComplete="new-password" />
          </div>
          <p className="mt-3 text-xs text-ink-soft">Leave the password fields empty if you do not want to change your password.</p>
        </Section>
      </div>
    </>
  );
}
