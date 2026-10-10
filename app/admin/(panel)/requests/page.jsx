"use client";
import { useState } from "react";
import { Download, Check, X, CheckCheck, Eye, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import RowActions from "@/components/admin/RowActions";
import {
  Toolbar,
  SearchBox,
  FilterSelect,
  Tabs,
} from "@/components/admin/Toolbar";
import { BloodBadge, Button, Status } from "@/components/ui";
import { adminRequests, statusTone } from "@/data/admin";
import { bloodGroups } from "@/data";

export default function AdminRequests() {
  const [rows, setRows] = useState(adminRequests);
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("All");
  const set = (id, status) =>
    setRows((l) => l.map((r) => (r.id === id ? { ...r, status } : r)));
  const list = rows.filter(
    (r) =>
      (tab === "All" || r.status === tab) &&
      (group === "All" || r.group === group) &&
      (r.patient + r.hospital).toLowerCase().includes(q.toLowerCase()),
  );
  const cols = [
    {
      key: "patient",
      label: "Patient",
      primary: true,
      render: (r) => (
        <div>
          <p className="font-semibold">{r.patient}</p>
          <p className="text-xs text-ink-soft">{r.bags} bag(s) needed</p>
        </div>
      ),
    },
    {
      key: "group",
      label: "Group",
      badge: true,
      render: (r) => <BloodBadge group={r.group} size="sm" />,
    },
    { key: "hospital", label: "Hospital" },
    {
      key: "location",
      label: "Location",
      render: (r) => <span className="whitespace-nowrap">{r.location}</span>,
    },
    {
      key: "needed",
      label: "Needed By",
      render: (r) => <span className="whitespace-nowrap">{r.needed}</span>,
    },
    {
      key: "urgency",
      label: "Urgency",
      render: (r) => <Status tone={statusTone[r.urgency]}>{r.urgency}</Status>,
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <Status tone={statusTone[r.status]}>{r.status}</Status>,
    },
  ];
  return (
    <>
      <PageHeader
        title="Blood Requests"
        description="Review and manage blood requests"
      >
        {/* <Button variant="outline">
          <Download className="h-4 w-4" />
          Export
        </Button> */}
      </PageHeader>
      <Tabs
        tabs={["All", "Pending", "Approved", "Fulfilled", "Rejected"]}
        value={tab}
        onChange={setTab}
      />
      <Toolbar>
        <SearchBox
          value={q}
          onChange={setQ}
          placeholder="Search patient or hospital"
        />
        <FilterSelect
          value={group}
          onChange={setGroup}
          options={["All", ...bloodGroups]}
          label="Group"
        />
      </Toolbar>
      <DataTable
        columns={cols}
        rows={list}
        empty="No requests found"
        actions={(r) => (
          <RowActions
            items={[
              ["View Details", Eye],
              ["Approve", Check, () => set(r.id, "Approved")],
              ["Mark Fulfilled", CheckCheck, () => set(r.id, "Fulfilled")],
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
