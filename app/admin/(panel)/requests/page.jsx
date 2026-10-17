"use client";
import { useState } from "react";
import { Check, X, CheckCheck, Eye, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import RowActions from "@/components/admin/RowActions";
import DetailsDrawer from "@/components/admin/DetailsDrawer";
import { Toolbar, SearchBox, FilterSelect, Tabs } from "@/components/admin/Toolbar";
import { useAdminList, useDebounced } from "@/components/admin/useAdminList";
import { useAdmin } from "@/components/admin/AdminContext";
import { dDate, dDateTime } from "@/components/admin/fmt";
import { BloodBadge, Status } from "@/components/ui";
import { statusTone } from "@/data/admin";
import { bloodGroups } from "@/data";
import { api } from "@/lib/client";

export default function AdminRequests() {
  const { reload: reloadBadges } = useAdmin();
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("All");
  const [view, setView] = useState(null);
  const [actionError, setActionError] = useState("");

  const search = useDebounced(q);
  const { items, loading, error, server, reload } = useAdminList("/api/admin/requests", {
    q: search.trim(),
    bloodGroup: group === "All" ? "" : group,
    status: tab === "All" ? "" : tab,
  });

  const run = async (fn) => {
    setActionError("");
    try {
      await fn();
      reload();
      reloadBadges();
    } catch (e) {
      setActionError(e.message);
    }
  };
  // PATCH /api/admin/requests/:id — Approve / Mark Fulfilled / Reject
  const set = (id, status) => run(() => api(`/api/admin/requests/${id}`, { method: "PATCH", body: { status } }));
  const remove = (r) => {
    if (!window.confirm(`Delete the request for ${r.patientName}? Its feed post will be deleted too.`)) return;
    run(() => api(`/api/admin/requests/${r.id}`, { method: "DELETE" }));
  };

  const cols = [
    {
      key: "patient",
      label: "Patient",
      primary: true,
      render: (r) => (
        <div>
          <p className="font-semibold">{r.patientName}</p>
          <p className="text-xs text-ink-soft">{r.bags} bag(s) needed</p>
        </div>
      ),
    },
    { key: "group", label: "Group", badge: true, render: (r) => <BloodBadge group={r.bloodGroup} size="sm" /> },
    { key: "hospital", label: "Hospital", render: (r) => r.hospital },
    { key: "location", label: "Location", render: (r) => <span className="whitespace-nowrap">{r.district}, {r.upazila}</span> },
    { key: "needed", label: "Needed By", render: (r) => <span className="whitespace-nowrap">{dDate(r.neededAt)}</span> },
    { key: "urgency", label: "Urgency", render: (r) => <Status tone={statusTone[r.urgency]}>{r.urgency}</Status> },
    { key: "status", label: "Status", render: (r) => <Status tone={statusTone[r.status]}>{r.status}</Status> },
  ];

  return (
    <>
      <PageHeader title="Blood Requests" description="Review and manage blood requests" />
      <Tabs tabs={["All", "Pending", "Approved", "Fulfilled", "Rejected"]} value={tab} onChange={setTab} />
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Search patient or hospital" />
        <FilterSelect value={group} onChange={setGroup} options={["All", ...bloodGroups]} label="Group" />
      </Toolbar>
      {(error || actionError) && <p role="alert" className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{error || actionError}</p>}
      <DataTable
        columns={cols}
        rows={items}
        server={server}
        empty={loading ? "Loading…" : "No requests found"}
        actions={(r) => (
          <RowActions
            items={[
              ["View Details", Eye, () => setView(r)],
              ["Approve", Check, () => set(r.id, "Approved")],
              ["Mark Fulfilled", CheckCheck, () => set(r.id, "Fulfilled")],
              ["Reject", X, () => set(r.id, "Rejected")],
              ["Delete", Trash2, () => remove(r), true],
            ]}
          />
        )}
      />
      <DetailsDrawer
        open={!!view}
        onClose={() => setView(null)}
        title={view ? `${view.patientName} · ${view.bloodGroup}` : ""}
        subtitle={view ? `${view.status} · ${view.urgency}` : ""}
        rows={view ? [
          ["Requested by", view.requester ? `${view.requester.name} (${view.requester.donorId || "—"})` : "Deleted user"],
          ["Contact phone", view.contactPhone],
          ["Patient age", view.age != null ? `${view.age} years` : "—"],
          ["Bags needed", view.bags],
          ["Hemoglobin", view.hemoglobin ?? "Unknown"],
          ["Reason", view.reason],
          ["Hospital", view.hospital],
          ["Location", [view.division, view.district, view.upazila].filter(Boolean).join(", ")],
          ["Needed by", dDateTime(view.neededAt)],
          ["Details", view.details || "—"],
          ["Submitted", dDateTime(view.createdAt)],
        ] : []}
      />
    </>
  );
}
