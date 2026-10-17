"use client";

import { useState } from "react";
import { Plus, Eye, Pencil, Ban, CheckCircle2, Trash2 } from "lucide-react";

import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import FormDrawer from "@/components/admin/FormDrawer";
import RowActions from "@/components/admin/RowActions";
import { Toolbar, SearchBox, FilterSelect } from "@/components/admin/Toolbar";
import { useAdminList, useDebounced } from "@/components/admin/useAdminList";
import { dDate } from "@/components/admin/fmt";

import { Avatar, BloodBadge, Button, Field, Select, Status } from "@/components/ui";

import { statusTone } from "@/data/admin";
import { bloodGroups, upazilas } from "@/data";
import { DIVISION_NAMES, districtsOf } from "@/data/locations";
import { api } from "@/lib/client";
import { toDateInput } from "@/lib/format";

// বিভাগ বদলালে জেলার তালিকা বদলায় — তাই আলাদা ছোট component
function LocationFields({ donor }) {
  const [division, setDivision] = useState(donor.division || "");
  const [district, setDistrict] = useState(donor.district || "");
  const [upazila, setUpazila] = useState(donor.upazila || "");
  const distOptions = [...new Set([...districtsOf(division), ...(division === donor.division ? [donor.district] : [])])].filter(Boolean);
  const upOptions = [...new Set([...upazilas, donor.upazila])].filter(Boolean);
  return (
    <>
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4">
        <Select name="division" label="Division" required options={DIVISION_NAMES} placeholder="Select division" value={division} onChange={(e) => { setDivision(e.target.value); setDistrict(""); }} />
        <Select name="district" label="District" required options={distOptions} placeholder="Select district" value={district} onChange={(e) => setDistrict(e.target.value)} />
        <Select name="upazila" label="Upazila" required options={upOptions} placeholder="Select upazila" value={upazila} onChange={(e) => setUpazila(e.target.value)} />
        <Field name="area" label="Village / Area" placeholder="Village or area" defaultValue={donor.area} />
      </div>
    </>
  );
}

export default function AdminDonors() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("All");
  const [status, setStatus] = useState("All");
  const [drawer, setDrawer] = useState(null);
  const [actionError, setActionError] = useState("");

  const search = useDebounced(q);
  const { items, pagination, loading, error, server, reload } = useAdminList("/api/admin/donors", {
    q: search.trim(),
    bloodGroup: group === "All" ? "" : group,
    status: status === "All" ? "" : status,
  });

  // Add / Edit → POST /api/admin/donors, PATCH /api/admin/donors/:id
  const save = async (formData) => {
    const v = Object.fromEntries(formData.entries());
    if (drawer === "new") {
      await api("/api/admin/donors", { method: "POST", body: v });
    } else {
      if (!v.password) delete v.password;
      await api(`/api/admin/donors/${drawer.id}`, { method: "PATCH", body: v });
    }
    reload();
  };

  const run = async (fn) => {
    setActionError("");
    try {
      await fn();
      reload();
    } catch (e) {
      setActionError(e.message);
    }
  };
  const toggleStatus = (d) => run(() => api(`/api/admin/donors/${d.id}`, { method: "PATCH", body: { status: d.status === "Blocked" ? "Active" : "Blocked" } }));
  const deleteDonor = (d) => {
    if (!window.confirm(`Delete ${d.name}? Their posts, comments and requests will be deleted too. This cannot be undone.`)) return;
    run(() => api(`/api/admin/donors/${d.id}`, { method: "DELETE" }));
  };

  const cols = [
    {
      key: "name",
      label: "Donor",
      primary: true,
      render: (r) => (
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="shrink-0">
            <Avatar name={r.name} src={r.photo} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold sm:text-base">{r.name}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{r.donorId}</p>
            <p className="max-w-[150px] truncate text-xs text-ink-soft sm:max-w-none">{r.phone}</p>
          </div>
        </div>
      ),
    },
    { key: "group", label: "Group", badge: true, render: (r) => <BloodBadge group={r.bloodGroup} size="sm" /> },
    { key: "location", label: "Location", render: (r) => <span className="whitespace-nowrap text-sm">{r.district}, {r.upazila}</span> },
    { key: "last", label: "Last Donation", render: (r) => <span className="whitespace-nowrap text-sm">{dDate(r.lastDonationDate)}</span> },
    { key: "donationCount", label: "Donations" },
    { key: "status", label: "Status", render: (r) => <Status tone={statusTone[r.status]}>{r.status}</Status> },
  ];

  const actions = (r) => (
    <RowActions
      items={[
        ["View Profile", Eye, () => window.open(`/donors/${r.id}`, "_blank", "noopener")],
        ["Edit", Pencil, () => setDrawer(r)],
        [r.status === "Blocked" ? "Unblock" : "Block", r.status === "Blocked" ? CheckCircle2 : Ban, () => toggleStatus(r)],
        ["Delete", Trash2, () => deleteDonor(r), true],
      ]}
    />
  );

  const editing = drawer && drawer !== "new" ? drawer : {};

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <PageHeader title="Donors" description={`${pagination.total} registered donors`}>
        <Button onClick={() => setDrawer("new")} className="w-full justify-center sm:w-auto">
          <Plus className="h-4 w-4 shrink-0" />
          <span>Add Donor</span>
        </Button>
      </PageHeader>

      <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 sm:rounded-2xl sm:p-4">
        <Toolbar>
          <div className="w-full min-w-0">
            <SearchBox value={q} onChange={setQ} placeholder="Search by name, ID or phone" />
          </div>
          <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:gap-3">
            <div className="min-w-0"><FilterSelect value={group} onChange={setGroup} options={["All", ...bloodGroups]} label="Group" /></div>
            <div className="min-w-0"><FilterSelect value={status} onChange={setStatus} options={["All", "Active", "Pending", "Blocked"]} label="Status" /></div>
          </div>
        </Toolbar>
        <div className="mt-3 text-xs text-ink-soft sm:mt-4">
          {loading ? "Loading…" : `Showing ${items.length} of ${pagination.total} donors`}
        </div>
      </div>

      {(error || actionError) && <p role="alert" className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{error || actionError}</p>}

      <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white sm:rounded-2xl">
        <DataTable columns={cols} rows={items} actions={actions} server={server} empty={loading ? "Loading…" : "No donors match your filters"} />
      </div>

      <FormDrawer
        open={!!drawer}
        onClose={() => setDrawer(null)}
        title={drawer === "new" ? "Add Donor" : "Edit Donor"}
        subtitle="Fill in the donor information"
        submitLabel={drawer === "new" ? "Add Donor" : "Save Changes"}
        onSubmit={save}
      >
        <div key={editing.id || "new"} className="space-y-3 sm:space-y-4">
          <Field name="name" label="Full Name" required placeholder="Enter full name" defaultValue={editing.name} />
          <Field name="phone" label="Mobile Number" required type="tel" placeholder="01XXXXXXXXX" defaultValue={editing.phone} />
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4">
            <Select name="bloodGroup" label="Blood Group" required options={bloodGroups} placeholder="Choose blood group" defaultValue={editing.bloodGroup || ""} />
            <Select name="status" label="Status" options={["Active", "Pending", "Blocked"]} defaultValue={editing.status || "Active"} />
          </div>
          <LocationFields donor={editing} />
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4">
            <Field name="lastDonationDate" label="Last Donation Date" type="date" defaultValue={toDateInput(editing.lastDonationDate)} />
            <Field name="donationCount" label="Total Donations" type="number" min="0" defaultValue={editing.donationCount ?? 0} />
          </div>
          {/* Top Donor স্কোরে +30: দুটোই "Yes" হলে */}
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4">
            <Select name="nidVerified" label="NID Verified" options={["No", "Yes"]} defaultValue={editing.nidVerified ? "Yes" : "No"} />
            <Select name="phoneVerified" label="Phone Verified" options={["No", "Yes"]} defaultValue={editing.phoneVerified ? "Yes" : "No"} />
          </div>
          <Field name="password" label={drawer === "new" ? "Password" : "Reset Password (optional)"} type="password" autoComplete="new-password" required={drawer === "new"} placeholder="Min 8 characters, letter + number" />
        </div>
      </FormDrawer>
    </div>
  );
}
