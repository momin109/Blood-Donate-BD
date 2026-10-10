"use client";
import { useState } from "react";
import { Download, XCircle, Trash2, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import RowActions from "@/components/admin/RowActions";
import { Tabs } from "@/components/admin/Toolbar";
import { Button, Status } from "@/components/ui";
import { adminReports, statusTone } from "@/data/admin";

export default function AdminReports() {
  const [rows, setRows] = useState(adminReports);
  const [tab, setTab] = useState("All");
  const set = (id, status) =>
    setRows((l) => l.map((r) => (r.id === id ? { ...r, status } : r)));
  const list = rows.filter((r) => tab === "All" || r.status === tab);
  const cols = [
    {
      key: "post",
      label: "Reported Post",
      primary: true,
      render: (r) => (
        <p className="line-clamp-2 min-w-[220px] font-medium md:max-w-sm">
          {r.post}
        </p>
      ),
    },
    {
      key: "status",
      label: "Status",
      badge: true,
      render: (r) => <Status tone={statusTone[r.status]}>{r.status}</Status>,
    },
    { key: "reason", label: "Reason" },
    {
      key: "by",
      label: "Reported By",
      render: (r) => <span className="whitespace-nowrap">{r.by}</span>,
    },
    {
      key: "date",
      label: "Date",
      render: (r) => <span className="whitespace-nowrap">{r.date}</span>,
    },
  ];
  return (
    <>
      <PageHeader title="Reports" description="Posts reported by users">
        {/* <Button variant="outline">
          <Download className="h-4 w-4" />
          Export
        </Button> */}
      </PageHeader>
      <Tabs
        tabs={["All", "Open", "Resolved", "Dismissed"]}
        value={tab}
        onChange={setTab}
      />
      <DataTable
        columns={cols}
        rows={list}
        empty="No reports"
        actions={(r) => (
          <RowActions
            items={[
              ["Dismiss Report", XCircle, () => set(r.id, "Dismissed")],
              ["Warn User", AlertTriangle, () => set(r.id, "Resolved")],
              ["Remove Post", Trash2, () => set(r.id, "Resolved"), true],
            ]}
          />
        )}
      />
    </>
  );
}
