"use client";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ClipboardCheck, RefreshCw } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import FormDrawer from "@/components/admin/FormDrawer";
import RowActions from "@/components/admin/RowActions";
import RankBadge from "@/components/RankBadge";
import { FilterSelect, SearchBox, Tabs, Toolbar } from "@/components/admin/Toolbar";
import { useAdminList, useDebounced } from "@/components/admin/useAdminList";
import { useAdmin } from "@/components/admin/AdminContext";
import { dDate } from "@/components/admin/fmt";
import { Button, Field, Select, Status } from "@/components/ui";
import { statusTone } from "@/data/admin";
import { api } from "@/lib/client";

const TABS = ["Donations", "Ranking"];
const yn = (v) => (v ? "Yes" : "No");
const errBox = "rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700";

export default function AdminTopDonors() {
  const { reload: reloadBadges } = useAdmin();
  const [tab, setTab] = useState(TABS[0]);
  return (
    <>
      <PageHeader title="Top Donors" description="Approve donations and manage the leaderboard" />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === TABS[0] ? <Donations reloadBadges={reloadBadges} /> : <Ranking />}
    </>
  );
}

// ---- রক্তদান অনুমোদন ----
function Donations({ reloadBadges }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("Pending");
  const [review, setReview] = useState(null);
  const search = useDebounced(q);
  const { items, loading, error, server, reload } = useAdminList("/api/admin/donations", { q: search.trim(), status: status === "All" ? "" : status });

  const save = async (fd) => {
    const v = Object.fromEntries(fd.entries());
    await api(`/api/admin/donations/${review.id}`, {
      method: "PATCH",
      body: { action: v.decision === "Approve" ? "approve" : "reject", respondedWithinHour: v.respondedWithinHour, callReceived: v.callReceived, rating: v.rating, note: v.note },
    });
    reload();
    reloadBadges();
  };

  const cols = [
    {
      key: "donor",
      label: "Donor",
      primary: true,
      render: (r) => (
        <div className="min-w-[160px]">
          <p className="font-semibold">{r.donor.name}</p>
          <p className="text-xs text-ink-soft">{[r.donor.donorId, r.donor.phone].filter(Boolean).join(" · ")}</p>
        </div>
      ),
    },
    { key: "hospital", label: "Hospital", render: (r) => <span className="line-clamp-2 md:max-w-[220px]">{r.hospital}</span> },
    { key: "date", label: "Donated On", render: (r) => <span className="whitespace-nowrap">{dDate(r.donatedAt)}</span> },
    { key: "status", label: "Status", badge: true, render: (r) => <Status tone={statusTone[r.status]}>{r.status}</Status> },
    {
      key: "bonus",
      label: "Checks",
      render: (r) =>
        r.status === "Approved" ? (
          <span className="whitespace-nowrap text-xs text-ink-soft">
            {r.respondedWithinHour ? "≤1h reply · " : ""}{r.callReceived ? "Call · " : ""}{r.rating ? `★ ${r.rating}` : "No rating"}
          </span>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <>
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Search by donor name, ID or phone..." />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={["Pending", "Approved", "Rejected", "All"]} />
      </Toolbar>
      {error && <p role="alert" className={`mb-4 ${errBox}`}>{error}</p>}
      <DataTable
        columns={cols}
        rows={items}
        server={server}
        empty={loading ? "Loading…" : status === "Pending" ? "No donations waiting for approval" : "No donations"}
        actions={(r) => <RowActions items={[[r.status === "Pending" ? "Review" : "Edit Review", ClipboardCheck, () => setReview(r)]]} />}
      />

      <FormDrawer
        open={!!review}
        onClose={() => setReview(null)}
        title="Review Donation"
        subtitle={review ? `${review.donor.name} · ${review.hospital} · ${dDate(review.donatedAt)}` : ""}
        submitLabel="Save Decision"
        onSubmit={save}
      >
        <div key={review?.id || "none"} className="space-y-4">
          <Select name="decision" label="Decision" required options={["Approve", "Reject"]} defaultValue={review?.status === "Rejected" ? "Reject" : "Approve"} />
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            <Select name="respondedWithinHour" label="Replied within 1 hour (+20)" options={["No", "Yes"]} defaultValue={yn(review?.respondedWithinHour)} />
            <Select name="callReceived" label="Call received (+10)" options={["No", "Yes"]} defaultValue={yn(review?.callReceived)} />
          </div>
          <Select name="rating" label="Receiver rating (stars)" options={["—", "1", "2", "3", "4", "5"]} defaultValue={review?.rating ? String(review.rating) : "—"} />
          <Field name="note" as="textarea" rows={2} maxLength={300} label="Note (shown to the donor if rejected)" defaultValue={review?.note || ""} />
          <p className="text-xs text-ink-soft">Approving counts this donation in the ranking. A second donation at the same hospital within 3 months cannot be approved.</p>
        </div>
      </FormDrawer>
    </>
  );
}

// ---- বর্তমান র‍্যাংকিং ----
function Ranking() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      setItems((await api("/api/admin/ranking")).items);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const recalc = async () => {
    setBusy(true);
    setMsg("");
    try {
      const d = await api("/api/admin/ranking", { method: "POST" });
      setItems(d.items);
      setError("");
      setMsg(`Ranking updated — ${d.ranked} donor(s) ranked.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const cols = [
    { key: "rank", label: "Rank", primary: true, render: (r) => <span className="font-extrabold">#{r.rank}</span> },
    {
      key: "name",
      label: "Donor",
      render: (r) => (
        <div className="min-w-[150px]">
          <p className="font-semibold">{r.name}</p>
          <p className="text-xs text-ink-soft">{r.donorId}</p>
        </div>
      ),
    },
    { key: "badge", label: "Badge", badge: true, render: (r) => (r.badge === "none" ? <span className="text-ink-soft">—</span> : <RankBadge badge={r.badge} />) },
    { key: "donations", label: "Donations", render: (r) => r.donations },
    { key: "rating", label: "Avg Rating", render: (r) => (r.avgRating ? `★ ${r.avgRating}` : "—") },
    { key: "score", label: "Score", render: (r) => <b>{r.score}</b> },
    {
      key: "verified",
      label: "Verified",
      render: (r) => (
        <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs">
          {r.nidVerified && r.phoneVerified ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : null}
          NID {yn(r.nidVerified)} · Phone {yn(r.phoneVerified)}
        </span>
      ),
    },
  ];

  return (
    <>
      <Toolbar>
        <p className="flex-1 text-sm text-ink-soft">
          Updates after every approval and nightly at 12:00 AM (Asia/Dhaka). Set NID / Phone verification from Donors → Edit.
        </p>
        <Button onClick={recalc} disabled={busy} className="w-full sm:w-auto">
          <RefreshCw className={busy ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          {busy ? "Recalculating…" : "Recalculate Ranking"}
        </Button>
      </Toolbar>
      {error && <p role="alert" className={`mb-4 ${errBox}`}>{error}</p>}
      {msg && <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{msg}</p>}
      <DataTable columns={cols} rows={items} pageSize={10} empty={loading ? "Loading…" : "No ranked donors yet — approve a donation first"} />
    </>
  );
}
