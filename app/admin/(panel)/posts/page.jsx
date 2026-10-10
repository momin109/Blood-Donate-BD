"use client";
import { useState } from "react";
import { ShieldCheck, Check, X, Eye, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import RowActions from "@/components/admin/RowActions";
import { Toolbar, SearchBox, Tabs } from "@/components/admin/Toolbar";
import { Avatar, Card, Status, Switch } from "@/components/ui";
import { adminPosts, statusTone } from "@/data/admin";

export default function AdminPosts() {
  const [rows, setRows] = useState(adminPosts);
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [auto, setAuto] = useState(true);
  const set = (id, status) =>
    setRows((l) => l.map((r) => (r.id === id ? { ...r, status } : r)));
  const list = rows.filter(
    (r) =>
      (tab === "All" || r.status === tab) &&
      (r.text + r.author).toLowerCase().includes(q.toLowerCase()),
  );
  const cols = [
    {
      key: "author",
      label: "Author",
      primary: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.author} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{r.author}</p>
            <p className="text-xs text-ink-soft">{r.time}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      badge: true,
      render: (r) => <Status tone={statusTone[r.status]}>{r.status}</Status>,
    },
    {
      key: "text",
      label: "Content",
      render: (r) => (
        <p className="line-clamp-2 min-w-[200px] md:max-w-xs">{r.text}</p>
      ),
    },
    { key: "type", label: "Type" },
    {
      key: "reports",
      label: "Reports",
      render: (r) => (
        <span
          className={r.reports ? "font-bold text-brand-600" : "text-ink-soft"}
        >
          {r.reports}
        </span>
      ),
    },
  ];
  return (
    <>
      <PageHeader
        title="Posts"
        description="Moderate posts and manage the auto-approve system"
      />
      {/* <Card className="mb-5 flex items-start gap-4 p-4 sm:items-center sm:p-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">Auto-Approve Posts</p>
          <p className="text-sm text-ink-soft">
            New posts that pass automatic checks are published instantly. Others
            wait here for review.
          </p>
        </div>
        <Switch on={auto} onChange={setAuto} />
      </Card> */}
      <Tabs
        tabs={["All", "Pending", "Auto-Approved", "Rejected"]}
        value={tab}
        onChange={setTab}
      />
      <Toolbar>
        <SearchBox
          value={q}
          onChange={setQ}
          placeholder="Search posts or authors"
        />
      </Toolbar>
      <DataTable
        columns={cols}
        rows={list}
        empty="No posts found"
        actions={(r) => (
          <RowActions
            items={[
              ["View Post", Eye],
              ["Approve", Check, () => set(r.id, "Approved")],
              ["Reject", X, () => set(r.id, "Rejected")],
              [
                "Delete",
                Trash2,
                () => setRows((l) => l.filter((x) => x.id !== r.id)),
                true,
              ],
            ]}
          />
        )}
      />
    </>
  );
}
