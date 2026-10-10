"use client";

import { useState } from "react";
import { Plus, Eye, Pencil, Ban, CheckCircle2, Trash2 } from "lucide-react";

import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import FormDrawer from "@/components/admin/FormDrawer";
import RowActions from "@/components/admin/RowActions";
import { Toolbar, SearchBox, FilterSelect } from "@/components/admin/Toolbar";

import {
  Avatar,
  BloodBadge,
  Button,
  Field,
  Select,
  Status,
} from "@/components/ui";

import { adminDonors, statusTone } from "@/data/admin";
import { bloodGroups } from "@/data";

export default function AdminDonors() {
  const [rows, setRows] = useState(adminDonors);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("All");
  const [status, setStatus] = useState("All");
  const [drawer, setDrawer] = useState(null);

  const list = rows.filter((r) => {
    const searchText = `${r.name} ${r.donorId} ${r.phone}`.toLowerCase();

    return (
      (group === "All" || r.group === group) &&
      (status === "All" || r.status === status) &&
      searchText.includes(q.toLowerCase().trim())
    );
  });

  const save = (formData) => {
    const values = Object.fromEntries(formData.entries());

    if (drawer === "new") {
      setRows((currentRows) => [
        {
          id: Date.now(),
          donorId: `BD-${String(currentRows.length + 100).padStart(5, "0")}`,
          donations: 0,
          last: "—",
          ...values,
        },
        ...currentRows,
      ]);
    } else {
      setRows((currentRows) =>
        currentRows.map((row) =>
          row.id === drawer.id ? { ...row, ...values } : row,
        ),
      );
    }

    setDrawer(null);
  };

  const toggleStatus = (donor) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === donor.id
          ? {
              ...row,
              status: donor.status === "Blocked" ? "Active" : "Blocked",
            }
          : row,
      ),
    );
  };

  const deleteDonor = (donor) => {
    setRows((currentRows) => currentRows.filter((row) => row.id !== donor.id));
  };

  const cols = [
    {
      key: "name",
      label: "Donor",
      primary: true,
      render: (r) => (
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="shrink-0">
            <Avatar name={r.name} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold sm:text-base">
              {r.name}
            </p>

            <p className="mt-0.5 text-xs text-ink-soft">{r.donorId}</p>

            <p className="max-w-[150px] truncate text-xs text-ink-soft sm:max-w-none">
              {r.phone}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "group",
      label: "Group",
      badge: true,
      render: (r) => <BloodBadge group={r.group} size="sm" />,
    },
    {
      key: "location",
      label: "Location",
      render: (r) => (
        <span className="whitespace-nowrap text-sm">{r.location}</span>
      ),
    },
    {
      key: "last",
      label: "Last Donation",
      render: (r) => (
        <span className="whitespace-nowrap text-sm">{r.last}</span>
      ),
    },
    {
      key: "donations",
      label: "Donations",
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <Status tone={statusTone[r.status]}>{r.status}</Status>,
    },
  ];

  const actions = (r) => (
    <RowActions
      items={[
        ["View Profile", Eye],
        ["Edit", Pencil, () => setDrawer(r)],
        [
          r.status === "Blocked" ? "Unblock" : "Block",
          r.status === "Blocked" ? CheckCircle2 : Ban,
          () => toggleStatus(r),
        ],
        ["Delete", Trash2, () => deleteDonor(r), true],
      ]}
    />
  );

  const editingDonor = drawer && drawer !== "new" ? drawer : {};

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <PageHeader
        title="Donors"
        description={`${rows.length} registered donors`}
      >
        <Button
          onClick={() => setDrawer("new")}
          className="w-full justify-center sm:w-auto"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Add Donor</span>
        </Button>
      </PageHeader>

      <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 sm:rounded-2xl sm:p-4">
        <Toolbar>
          <div className="w-full min-w-0">
            <SearchBox
              value={q}
              onChange={setQ}
              placeholder="Search by name, ID or phone"
            />
          </div>

          <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:gap-3">
            <div className="min-w-0">
              <FilterSelect
                value={group}
                onChange={setGroup}
                options={["All", ...bloodGroups]}
                label="Group"
              />
            </div>

            <div className="min-w-0">
              <FilterSelect
                value={status}
                onChange={setStatus}
                options={["All", "Active", "Pending", "Blocked"]}
                label="Status"
              />
            </div>
          </div>
        </Toolbar>

        <div className="mt-3 text-xs text-ink-soft sm:mt-4">
          Showing {list.length} of {rows.length} donors
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white sm:rounded-2xl">
        <DataTable
          columns={cols}
          rows={list}
          actions={actions}
          empty="No donors match your filters"
        />
      </div>

      <FormDrawer
        open={!!drawer}
        onClose={() => setDrawer(null)}
        title={drawer === "new" ? "Add Donor" : "Edit Donor"}
        subtitle="Fill in the donor information"
        submitLabel={drawer === "new" ? "Add Donor" : "Save Changes"}
        onSubmit={save}
      >
        <div key={editingDonor.id || "new"} className="space-y-3 sm:space-y-4">
          <Field
            name="name"
            label="Full Name"
            required
            placeholder="Enter full name"
            defaultValue={editingDonor.name}
          />

          <Field
            name="phone"
            label="Mobile Number"
            required
            type="tel"
            placeholder="01XXXXXXXXX"
            defaultValue={editingDonor.phone}
          />

          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4">
            <Select
              name="group"
              label="Blood Group"
              required
              options={bloodGroups}
              defaultValue={editingDonor.group || ""}
            />

            <Select
              name="status"
              label="Status"
              options={["Active", "Pending", "Blocked"]}
              defaultValue={editingDonor.status || "Active"}
            />
          </div>

          <Field
            name="location"
            label="Location"
            placeholder="District, Upazila"
            defaultValue={editingDonor.location}
          />
        </div>
      </FormDrawer>
    </div>
  );
}
