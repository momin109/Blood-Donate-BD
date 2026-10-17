"use client";
import { useState } from "react";
import { Check, X, Eye, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import RowActions from "@/components/admin/RowActions";
import DetailsDrawer from "@/components/admin/DetailsDrawer";
import { Toolbar, SearchBox, Tabs } from "@/components/admin/Toolbar";
import { useAdminList, useDebounced } from "@/components/admin/useAdminList";
import { useAdmin } from "@/components/admin/AdminContext";
import { ago, dDateTime } from "@/components/admin/fmt";
import { Avatar, Status } from "@/components/ui";
import { statusTone } from "@/data/admin";
import { api } from "@/lib/client";

export default function AdminPosts() {
  const { reload: reloadStats } = useAdmin();
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [view, setView] = useState(null);
  const [actionError, setActionError] = useState("");

  const search = useDebounced(q);
  const { items, loading, error, server, reload } = useAdminList("/api/admin/posts", { q: search.trim(), status: tab === "All" ? "" : tab });

  const run = async (fn) => {
    setActionError("");
    try {
      await fn();
      reload();
      reloadStats();
    } catch (e) {
      setActionError(e.message);
    }
  };
  // PATCH /api/admin/posts/:id — Approved = feed-এ দেখায়, Rejected = লুকায়
  const set = (id, status) => run(() => api(`/api/admin/posts/${id}`, { method: "PATCH", body: { status } }));
  const remove = (r) => {
    if (!window.confirm("Delete this post with its comments and likes? This cannot be undone.")) return;
    run(() => api(`/api/admin/posts/${r.id}`, { method: "DELETE" }));
  };

  const cols = [
    {
      key: "author",
      label: "Author",
      primary: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.author?.name || "?"} src={r.author?.photo} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{r.author?.name || "Deleted user"}</p>
            <p className="text-xs text-ink-soft">{ago(r.createdAt)}</p>
          </div>
        </div>
      ),
    },
    { key: "status", label: "Status", badge: true, render: (r) => <Status tone={statusTone[r.status]}>{r.status}</Status> },
    {
      key: "text",
      label: "Content",
      render: (r) => <p className="line-clamp-2 min-w-[200px] md:max-w-xs">{r.text || (r.images.length ? `📷 ${r.images.length} photo(s)` : "—")}</p>,
    },
    { key: "type", label: "Type" },
    {
      key: "reports",
      label: "Reports",
      render: (r) => <span className={r.reports ? "font-bold text-brand-600" : "text-ink-soft"}>{r.reports}</span>,
    },
  ];

  return (
    <>
      <PageHeader title="Posts" description="Moderate posts — rejected or pending posts are hidden from the feed" />
      <Tabs tabs={["All", "Pending", "Approved", "Rejected"]} value={tab} onChange={setTab} />
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Search posts or authors" />
      </Toolbar>
      {(error || actionError) && <p role="alert" className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{error || actionError}</p>}
      <DataTable
        columns={cols}
        rows={items}
        server={server}
        empty={loading ? "Loading…" : "No posts found"}
        actions={(r) => (
          <RowActions
            items={[
              ["View Post", Eye, () => setView(r)],
              ["Approve", Check, () => set(r.id, "Approved")],
              ["Reject", X, () => set(r.id, "Rejected")],
              ["Delete", Trash2, () => remove(r), true],
            ]}
          />
        )}
      />
      <DetailsDrawer
        open={!!view}
        onClose={() => setView(null)}
        title={view ? `Post by ${view.author?.name || "Deleted user"}` : ""}
        subtitle={view ? `${view.type} · ${view.status}` : ""}
        rows={view ? [
          ["Posted", dDateTime(view.createdAt)],
          ["Likes / Comments / Shares", `${view.likes} / ${view.comments} / ${view.shares}`],
          ["Reports", view.reports],
        ] : []}
      >
        {view && (
          <>
            <p className="whitespace-pre-line break-words rounded-2xl bg-surface p-4 text-sm">{view.text || "(No text)"}</p>
            {view.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {view.images.map((src) => (
                  <a key={src} href={src} target="_blank" rel="noopener noreferrer"><img src={src} alt="" className="aspect-square w-full rounded-xl object-cover" /></a>
                ))}
              </div>
            )}
          </>
        )}
      </DetailsDrawer>
    </>
  );
}
