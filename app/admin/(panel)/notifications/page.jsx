"use client";

import { useMemo, useState } from "react";
import {
  BellRing,
  CalendarClock,
  CheckCheck,
  Clock3,
  Droplet,
  Eye,
  Megaphone,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import FormDrawer from "@/components/admin/FormDrawer";
import StatCard from "@/components/admin/StatCard";
import {
  FilterSelect,
  SearchBox,
  Tabs,
  Toolbar,
} from "@/components/admin/Toolbar";
import { Button, Card, Field, Select, Status } from "@/components/ui";

const initialNotifications = [
  {
    id: 1,
    title: "জরুরি রক্তদানের অনুরোধ",
    message: "ঢাকা মেডিকেলে B+ রক্ত প্রয়োজন। সামর্থ্য থাকলে এগিয়ে আসুন।",
    audience: "All users",
    type: "Blood Alert",
    status: "Sent",
    createdAt: "আজ, ১০:২৫ AM",
    recipients: 1240,
    read: 862,
    actionLabel: "রক্তের অনুরোধ দেখুন",
    link: "/requests",
  },
  {
    id: 2,
    title: "রক্তদাতা নিবন্ধন সম্পন্ন করুন",
    message: "আপনার প্রোফাইলের তথ্য সম্পূর্ণ করে কমিউনিটিকে সাহায্য করুন।",
    audience: "Donors",
    type: "Announcement",
    status: "Sent",
    createdAt: "গতকাল, ০৬:১৫ PM",
    recipients: 684,
    read: 491,
    actionLabel: "প্রোফাইল দেখুন",
    link: "/me",
  },
  {
    id: 3,
    title: "রক্তদান সচেতনতা দিবস",
    message:
      "নিয়মিত রক্তদানের গুরুত্ব সম্পর্কে জানুন এবং সচেতনতা ছড়িয়ে দিন।",
    audience: "All users",
    type: "Announcement",
    status: "Scheduled",
    createdAt: "১২ অক্টোবর, ২০২৬ · ০৯:০০ AM",
    recipients: 0,
    read: 0,
    actionLabel: "বিস্তারিত",
    link: "/",
  },
  {
    id: 4,
    title: "আপনার এলাকার রক্তদাতাদের আপডেট",
    message: "রাজশাহী জেলার নতুন রক্তদাতাদের তালিকা এখন দেখে নিন।",
    audience: "District: Rajshahi",
    type: "Donor Update",
    status: "Draft",
    createdAt: "১০ অক্টোবর, ২০২৬ · ০২:৩০ PM",
    recipients: 0,
    read: 0,
    actionLabel: "রক্তদাতা দেখুন",
    link: "/donors",
  },
];

const statusTone = {
  Sent: "success",
  Scheduled: "warning",
  Draft: "neutral",
  Failed: "danger",
};

const typeIcon = {
  "Blood Alert": Droplet,
  Announcement: Megaphone,
  "Donor Update": Users,
  Reminder: BellRing,
};

const tabs = ["All", "Sent", "Scheduled", "Draft"];

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [drawer, setDrawer] = useState(null);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("All");
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notifications.filter((item) => {
      const matchesTab = tab === "All" || item.status === tab;
      const matchesAudience =
        audienceFilter === "All" || item.audience === audienceFilter;
      const matchesQuery =
        !q ||
        `${item.title} ${item.message} ${item.audience} ${item.type}`
          .toLowerCase()
          .includes(q);
      return matchesTab && matchesAudience && matchesQuery;
    });
  }, [notifications, tab, query, audienceFilter]);

  const sentCount = notifications.filter(
    (item) => item.status === "Sent",
  ).length;
  const scheduledCount = notifications.filter(
    (item) => item.status === "Scheduled",
  ).length;
  const totalRecipients = notifications.reduce(
    (sum, item) => sum + (item.status === "Sent" ? item.recipients : 0),
    0,
  );
  const totalRead = notifications.reduce(
    (sum, item) => sum + (item.status === "Sent" ? item.read : 0),
    0,
  );

  const saveNotification = (formData) => {
    const values = Object.fromEntries(formData.entries());
    const editing = drawer && drawer !== "new";
    const isScheduled = values.delivery === "Schedule";
    const status = isScheduled
      ? "Scheduled"
      : values.delivery === "Draft"
        ? "Draft"
        : "Sent";
    const item = {
      id: editing ? drawer.id : Date.now(),
      title: values.title?.trim() || "Untitled notification",
      message: values.message?.trim() || "",
      audience: values.audience || "All users",
      type: values.type || "Announcement",
      status,
      createdAt:
        isScheduled && values.scheduleAt ? values.scheduleAt : "এখনই · Demo UI",
      recipients:
        status === "Sent"
          ? values.audience === "All users"
            ? 1240
            : values.audience === "Donors"
              ? 684
              : 126
          : 0,
      read: 0,
      actionLabel: values.actionLabel?.trim() || "বিস্তারিত দেখুন",
      link: values.link?.trim() || "/",
    };

    if (editing) {
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === drawer.id
            ? { ...notification, ...item }
            : notification,
        ),
      );
    } else {
      setNotifications((current) => [item, ...current]);
    }

    setNotice(
      status === "Sent"
        ? "Demo UI: নোটিফিকেশন Sent তালিকায় যোগ হয়েছে। বাস্তবে ব্যবহারকারীদের কাছে পাঠানো হয়নি।"
        : status === "Scheduled"
          ? "Demo UI: নোটিফিকেশন Scheduled তালিকায় যোগ হয়েছে। বাস্তবে নির্ধারিত সময়ে পাঠানো হবে না।"
          : "নোটিফিকেশন Draft হিসেবে সংরক্ষিত হয়েছে (শুধু এই পেজের বর্তমান state-এ)।",
    );
  };

  const deleteNotification = (id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
    setNotice("নোটিফিকেশনটি তালিকা থেকে সরানো হয়েছে।");
  };

  const current = drawer && drawer !== "new" ? drawer : {};

  return (
    <>
      <PageHeader
        title="Notification Management"
        description="রক্তদাতা ও সদস্যদের জন্য নোটিফিকেশন তৈরি, পাঠানো এবং পরিচালনা করুন।"
      >
        <Button
          onClick={() => {
            setNotice("");
            setDrawer("new");
          }}
        >
          <Plus className="h-4 w-4" />
          Create Notification
        </Button>
      </PageHeader>

      {notice && (
        <div
          className="mb-5 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-800"
          role="status"
        >
          <BellRing className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="flex-1">{notice}</p>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
            className="rounded-lg p-1 hover:bg-brand-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BellRing}
          label="Total notifications"
          value={notifications.length}
          tone="brand"
        />
        <StatCard
          icon={CheckCheck}
          label="Sent campaigns"
          value={sentCount}
          tone="green"
        />
        <StatCard
          icon={CalendarClock}
          label="Scheduled"
          value={scheduledCount}
          tone="amber"
        />
        <StatCard
          icon={Eye}
          label="Sample recipients reached"
          value={totalRecipients.toLocaleString()}
          tone="blue"
          delta={undefined}
        />
      </div>

      <Card className="mb-5 p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold">Campaign performance</h2>
            <p className="text-sm text-ink-soft">
              Sample UI metrics only — not real delivery or read receipts.
            </p>
          </div>
          <div className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 sm:mt-0">
            <span className="h-2 w-2 rounded-full bg-green-500" /> Read rate:{" "}
            {totalRecipients
              ? Math.round((totalRead / totalRecipients) * 100)
              : 0}
            %
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
            style={{
              width: `${totalRecipients ? Math.min(100, (totalRead / totalRecipients) * 100) : 0}%`,
            }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-ink-soft">
          <span>{totalRead.toLocaleString()} sample reads</span>
          <span>{totalRecipients.toLocaleString()} sample recipients</span>
        </div>
      </Card>

      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      <Toolbar>
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search notifications..."
        />
        <FilterSelect
          value={audienceFilter}
          onChange={setAudienceFilter}
          label="Audience"
          options={["All", "All users", "Donors", "District: Rajshahi"]}
        />
      </Toolbar>

      <div className="space-y-3">
        {filtered.map((item) => {
          const Icon = typeIcon[item.type] || BellRing;
          const readRate = item.recipients
            ? Math.round((item.read / item.recipients) * 100)
            : 0;
          return (
            <Card key={item.id} className="min-w-0 p-4 sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 sm:h-12 sm:w-12">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold leading-snug">{item.title}</h3>
                    <Status tone={statusTone[item.status] || "neutral"}>
                      {item.status}
                    </Status>
                  </div>
                  <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-ink-soft">
                    {item.message}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {item.audience}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {item.createdAt}
                    </span>
                    {item.status === "Sent" && (
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {item.recipients.toLocaleString()} recipients ·{" "}
                        {readRate}% read
                      </span>
                    )}
                  </div>
                  {item.actionLabel && (
                    <span className="mt-3 inline-flex rounded-lg border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
                      {item.actionLabel} <span className="ml-1">↗</span>
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label={`Edit ${item.title}`}
                    onClick={() => {
                      setNotice("");
                      setDrawer(item);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="soft"
                    aria-label={`Delete ${item.title}`}
                    onClick={() => deleteNotification(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
        {!filtered.length && (
          <Card className="p-10 text-center">
            <BellRing className="mx-auto mb-3 h-9 w-9 text-ink-soft" />
            <h3 className="font-bold">কোনো নোটিফিকেশন পাওয়া যায়নি</h3>
            <p className="mt-1 text-sm text-ink-soft">
              সার্চ বা ফিল্টার পরিবর্তন করুন, অথবা নতুন নোটিফিকেশন তৈরি করুন।
            </p>
          </Card>
        )}
      </div>

      <FormDrawer
        open={!!drawer}
        onClose={() => setDrawer(null)}
        title={drawer === "new" ? "Create Notification" : "Edit Notification"}
        subtitle="বার্তা, প্রাপক এবং পাঠানোর সময় নির্ধারণ করুন।"
        submitLabel={drawer === "new" ? "Create / Send" : "Save Changes"}
        onSubmit={saveNotification}
      >
        <div key={current.id || "new"} className="space-y-4">
          <Field
            name="title"
            label="Notification title"
            required
            placeholder="যেমন: জরুরি রক্তের প্রয়োজন"
            defaultValue={current.title}
          />
          <Field
            as="textarea"
            rows={4}
            name="message"
            label="Message"
            required
            placeholder="সদস্যদের কাছে যে বার্তাটি পাঠাতে চান..."
            defaultValue={current.message}
          />

          <div className="grid gap-4 min-[420px]:grid-cols-2">
            <Select
              name="type"
              label="Notification type"
              options={[
                "Blood Alert",
                "Announcement",
                "Donor Update",
                "Reminder",
              ]}
              defaultValue={current.type || "Announcement"}
            />
            <Select
              name="audience"
              label="Send to"
              options={["All users", "Donors", "District: Rajshahi"]}
              defaultValue={current.audience || "All users"}
            />
          </div>

          <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-3.5">
            <p className="flex items-center gap-2 text-sm font-semibold text-brand-800">
              <Users className="h-4 w-4" />
              Audience preview
            </p>
            <p className="mt-1 text-xs leading-5 text-brand-700">
              নির্বাচিত audience অনুযায়ী প্রাপক নির্ধারণের UI। এখানে দেখানো
              recipient সংখ্যা demo; বাস্তবে পাঠাতে backend ও user targeting
              লাগবে।
            </p>
          </div>

          <div className="grid gap-4 min-[420px]:grid-cols-2">
            <Field
              name="actionLabel"
              label="Optional button text"
              placeholder="রক্তের অনুরোধ দেখুন"
              defaultValue={current.actionLabel}
            />
            <Field
              name="link"
              label="Optional link"
              placeholder="/requests"
              defaultValue={current.link}
            />
          </div>

          <Select
            name="delivery"
            label="Delivery option"
            options={["Send now", "Schedule", "Draft"]}
            defaultValue={
              current.status === "Scheduled"
                ? "Schedule"
                : current.status === "Draft"
                  ? "Draft"
                  : "Send now"
            }
          />
          <Field
            name="scheduleAt"
            label="Scheduled date and time (if scheduling)"
            type="datetime-local"
            defaultValue={
              current.status === "Scheduled" ? "2026-10-12T09:00" : ""
            }
          />
          <p className="text-xs leading-5 text-ink-soft">
            এটি এখন Frontend demo। Send now নির্বাচন করলেও কোনো বাস্তব push
            notification, SMS বা email পাঠানো হবে না।
          </p>
        </div>
      </FormDrawer>
    </>
  );
}
