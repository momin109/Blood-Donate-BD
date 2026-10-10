"use client";
import { useState } from "react";
import { Save } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import PasswordField from "@/components/PasswordField";
import { Button, Card, Field, Select, Switch } from "@/components/ui";

function Section({ title, desc, children }) {
  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-5">
        <p className="text-lg font-bold">{title}</p>
        {desc && <p className="text-sm text-ink-soft">{desc}</p>}
      </div>
      {children}
      <div className="mt-5 flex sm:justify-end">
        <Button className="w-full sm:w-auto">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
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
  const [auto, setAuto] = useState(true);
  const [ads, setAds] = useState(true);
  const [mail, setMail] = useState(true);
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage website, moderation and account settings"
      />
      <div className="mx-auto max-w-3xl space-y-5">
        <Section title="General" desc="Basic website information">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Website Name" defaultValue="Blood Donate BD" />
            <Field
              label="Support Email"
              type="email"
              defaultValue="support@blooddonatebd.com"
            />
            <Field
              label="Support Phone"
              type="tel"
              defaultValue="+880 1700-000000"
            />
            <Field label="Website URL" defaultValue="www.blooddonatebd.com" />
          </div>
        </Section>
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
        <Section title="Admin Account" desc="Update your profile and password">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" defaultValue="Admin" />
            <Field
              label="Email"
              type="email"
              defaultValue="admin@blooddonatebd.com"
            />
            <PasswordField label="New Password" />
            <PasswordField label="Confirm Password" />
          </div>
        </Section>
      </div>
    </>
  );
}
