"use client";
import { useState } from "react";
import { XCircle, Trash2, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import RowActions from "@/components/admin/RowActions";
import { Tabs } from "@/components/admin/Toolbar";
import { useAdminList } from "@/components/admin/useAdminList";
import { useAdmin } from "@/components/admin/AdminContext";
import { dDate } from "@/components/admin/fmt";
import { Status } from "@/components/ui";
import { statusTone } from "@/data/admin";
import { api } from "@/lib/client";

export default function AdminReports() {
  const { reload: reloadBadges } = useAdmin();
  const [tab, setTab] = useState("All");
  const [actionError, setActionError] = useState("");
  const { items, loading, error, server, reload } = useAdminList("/api/admin/reports", { status: tab === "All" ? "" : tab });

  // PATCH /api/admin/reports/:id { action: dismiss | warn | remove }
  const act = async (id, action) => {
    setActionError("");
    try {
      await api(`/api/admin/reports/${id}`, { method: "PATCH", body: { action } });
      reload();
      reloadBadges();
    } catch (e) {
      setActionError(e.message);
    }
  };
  const removePost = (r) => {
    if (window.confirm("Hide this post from the feed? All reports on it will be marked Resolved.")) act(r.id, "remove");
  };

  const cols = [
    {
      key: "post",
      label: "Reported Post",
      primary: true,
      render: (r) => <p className="line-clamp-2 min-w-[220px] font-medium md:max-w-sm">{r.post ? r.post.text : "(Post deleted)"}</p>,
    },
    { key: "status", label: "Status", badge: true, render: (r) => <Status tone={statusTone[r.status]}>{r.status}</Status> },
    { key: "reason", label: "Reason", render: (r) => <span className="line-clamp-2 md:max-w-[220px]">{r.reason}</span> },
    { key: "by", label: "Reported By", render: (r) => <span className="whitespace-nowrap">{r.by}</span> },
    { key: "date", label: "Date", render: (r) => <span className="whitespace-nowrap">{dDate(r.createdAt)}</span> },
  ];

  return (
    <>
      <PageHeader title="Reports" description="Posts reported by users" />
      <Tabs tabs={["All", "Open", "Resolved", "Dismissed"]} value={tab} onChange={setTab} />
      {(error || actionError) && <p role="alert" className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{error || actionError}</p>}
      <DataTable
        columns={cols}
        rows={items}
        server={server}
        empty={loading ? "Loading…" : "No reports"}
        actions={(r) => (
          <RowActions
            items={[
              ["Dismiss Report", XCircle, () => act(r.id, "dismiss")],
              ["Warn User", AlertTriangle, () => act(r.id, "warn")],
              ["Remove Post", Trash2, () => removePost(r), true],
            ]}
          />
        )}
      />
    </>
  );
}
