"use client";
import { useState } from "react";
import { AlertTriangle, Eye, Lock, Trash2, Unlock, XCircle } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import RowActions from "@/components/admin/RowActions";
import ChatViewer from "@/components/admin/ChatViewer";
import { FilterSelect, SearchBox, Tabs, Toolbar } from "@/components/admin/Toolbar";
import { useAdminList, useDebounced } from "@/components/admin/useAdminList";
import { useAdmin } from "@/components/admin/AdminContext";
import { ago, dDate } from "@/components/admin/fmt";
import { Status } from "@/components/ui";
import { statusTone } from "@/data/admin";
import { api } from "@/lib/client";

const TABS = ["Conversations", "Reported Chats"];

export default function AdminChats() {
  const { reload: reloadBadges } = useAdmin();
  const [tab, setTab] = useState(TABS[0]);
  const [view, setView] = useState(null); // দেখা conversation-এর id
  const [actionError, setActionError] = useState("");

  // কোনো action চালিয়ে তালিকা ও sidebar badge নতুন করা
  const run = (reload) => async (fn) => {
    setActionError("");
    try {
      await fn();
      reload();
      reloadBadges();
    } catch (e) {
      setActionError(e.message);
    }
  };

  return (
    <>
      <PageHeader title="Chats" description="User conversations and reported chats" />
      <Tabs tabs={TABS} value={tab} onChange={(t) => { setTab(t); setActionError(""); }} />
      {actionError && <p role="alert" className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{actionError}</p>}
      {tab === TABS[0] ? <Conversations run={run} onView={setView} /> : <ReportedChats run={run} onView={setView} />}
      <ChatViewer id={view} onClose={() => setView(null)} />
    </>
  );
}

function Conversations({ run, onView }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const search = useDebounced(q);
  const { items, loading, error, server, reload } = useAdminList("/api/admin/chats", { q: search.trim(), filter: filter === "All" ? "" : filter });
  const go = run(reload);

  const lock = (c, action) => go(() => api(`/api/admin/chats/${c.id}`, { method: "PATCH", body: { action } }));
  const remove = (c) => {
    if (window.confirm("Delete this conversation and all its messages? This cannot be undone.")) go(() => api(`/api/admin/chats/${c.id}`, { method: "DELETE" }));
  };

  const cols = [
    {
      key: "participants",
      label: "Participants",
      primary: true,
      render: (c) => (
        <div className="min-w-[180px]">
          <p className="font-semibold">{c.participants.map((p) => p.name).join(" ↔ ")}</p>
          <p className="line-clamp-1 text-xs text-ink-soft md:max-w-xs">{c.lastMessage}</p>
        </div>
      ),
    },
    {
      key: "state",
      label: "Status",
      badge: true,
      render: (c) => (
        <div className="flex flex-wrap gap-1.5">
          {c.locked && <Status tone="neutral">Locked</Status>}
          {c.openReports > 0 && <Status tone="warning">{c.openReports} report(s)</Status>}
          {!c.locked && !c.openReports && <Status tone="success">Active</Status>}
        </div>
      ),
    },
    { key: "messages", label: "Messages", render: (c) => c.messages },
    { key: "last", label: "Last Message", render: (c) => <span className="whitespace-nowrap">{ago(c.lastAt)}</span> },
  ];

  return (
    <>
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Search by participant name..." />
        <FilterSelect label="Show" value={filter} onChange={setFilter} options={["All", "Reported", "Locked"]} />
      </Toolbar>
      {error && <p role="alert" className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{error}</p>}
      <DataTable
        columns={cols}
        rows={items}
        server={server}
        empty={loading ? "Loading…" : "No conversations"}
        actions={(c) => (
          <RowActions
            items={[
              ["View Messages", Eye, () => onView(c.id)],
              c.locked ? ["Unlock Chat", Unlock, () => lock(c, "unlock")] : ["Lock Chat", Lock, () => lock(c, "lock")],
              ["Delete Chat", Trash2, () => remove(c), true],
            ]}
          />
        )}
      />
    </>
  );
}

function ReportedChats({ run, onView }) {
  const [status, setStatus] = useState("Open");
  const { items, loading, error, server, reload } = useAdminList("/api/admin/chat-reports", { status: status === "All" ? "" : status });
  const go = run(reload);

  const act = (r, action) => go(() => api(`/api/admin/chat-reports/${r.id}`, { method: "PATCH", body: { action } }));
  const lock = (r) => {
    if (window.confirm("Lock this conversation? Nobody will be able to send new messages. Open reports on it will be marked Resolved.")) act(r, "lock");
  };

  const cols = [
    {
      key: "chat",
      label: "Reported Chat",
      primary: true,
      render: (r) => (
        <div className="min-w-[200px]">
          <p className="font-semibold">{r.by} <span className="font-normal text-ink-soft">reported</span> {r.reported}</p>
          <p className="line-clamp-1 text-xs text-ink-soft md:max-w-xs">{r.lastMessage || "—"}</p>
        </div>
      ),
    },
    { key: "status", label: "Status", badge: true, render: (r) => <Status tone={statusTone[r.status]}>{r.status}</Status> },
    { key: "reason", label: "Reason", render: (r) => <span className="line-clamp-2 md:max-w-[220px]">{r.reason}</span> },
    { key: "locked", label: "Chat", render: (r) => (r.locked ? <Status tone="neutral">Locked</Status> : "Open") },
    { key: "date", label: "Date", render: (r) => <span className="whitespace-nowrap">{dDate(r.createdAt)}</span> },
  ];

  return (
    <>
      <Toolbar>
        <FilterSelect label="Status" value={status} onChange={setStatus} options={["Open", "Resolved", "Dismissed", "All"]} />
      </Toolbar>
      {error && <p role="alert" className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{error}</p>}
      <DataTable
        columns={cols}
        rows={items}
        server={server}
        empty={loading ? "Loading…" : "No reported chats"}
        actions={(r) => (
          <RowActions
            items={[
              ["View Chat", Eye, () => onView(r.conversationId)],
              ["Dismiss Report", XCircle, () => act(r, "dismiss")],
              ["Warn User", AlertTriangle, () => act(r, "warn")],
              ["Lock Chat", Lock, () => lock(r), true],
            ]}
          />
        )}
      />
    </>
  );
}
