"use client";
import Link from "next/link";
import {
  Users,
  Droplet,
  FileText,
  HeartPulse,
  Download,
  Plus,
  Check,
  X,
  Activity,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import DataTable from "@/components/admin/DataTable";
import { BarChart, DistributionBars } from "@/components/admin/Charts";
import { Avatar, BloodBadge, Button, Card, Status } from "@/components/ui";
import { useAdmin } from "@/components/admin/AdminContext";
import { dDate, ago } from "@/components/admin/fmt";
import { statusTone } from "@/data/admin";

const cols = [
  {
    key: "patient",
    label: "Patient",
    primary: true,
    render: (r) => <span className="font-semibold">{r.patientName}</span>,
  },
  {
    key: "group",
    label: "Group",
    badge: true,
    render: (r) => <BloodBadge group={r.bloodGroup} size="sm" />,
  },
  {
    key: "hospital",
    label: "Hospital",
    render: (r) => (
      <span className="block max-w-[200px] truncate md:max-w-none">
        {r.hospital}
      </span>
    ),
  },
  {
    key: "needed",
    label: "Needed",
    render: (r) => <span className="whitespace-nowrap">{dDate(r.neededAt)}</span>,
  },
  {
    key: "status",
    label: "Status",
    render: (r) => <Status tone={statusTone[r.status]}>{r.status}</Status>,
  },
];

export default function Dashboard() {
  // সব সংখ্যা GET /api/admin/stats থেকে (AdminShell একবার এনে context-এ রাখে)
  const { stats } = useAdmin();
  const t = stats.totals;
  const n = (v) => v.toLocaleString("en-US");
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here is what is happening on Blood Donate BD today."
      >
        {/* <Button variant="outline">
          <Download className="h-4 w-4" />
          Export Report
        </Button> */}
        <Link href="/admin/donors">
          <Button>
            <Plus className="h-4 w-4" />
            Add Donor
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Donors"
          value={n(t.donors)}
          delta={t.donorsDelta ?? undefined}
        />
        <StatCard
          icon={Droplet}
          label="Active Requests"
          value={n(t.activeRequests)}
          delta={t.requestsDelta ?? undefined}
          tone="blue"
        />
        <StatCard
          icon={FileText}
          label="Total Posts"
          value={n(t.posts)}
          delta={t.postsDelta ?? undefined}
          tone="amber"
        />
        <StatCard
          icon={HeartPulse}
          label="Donated This Month"
          value={n(t.donatedThisMonth)}
          tone="green"
        />
      </div>

      {/* <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="min-w-0 p-4 sm:p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="font-bold">Donations Overview</p>
              <p className="text-sm text-ink-soft">Last 7 months</p>
            </div>
            <Status tone="success">+12.4% vs Sep</Status>
          </div>
          <BarChart data={monthly} />
        </Card>
        <Card className="min-w-0 p-4 sm:p-6">
          <p className="mb-4 font-bold">Blood Group Distribution</p>
          <DistributionBars data={bloodDist} />
        </Card>
      </div> */}

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-bold">Recent Blood Requests</p>
            <Link
              href="/admin/requests"
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <DataTable
            columns={cols}
            rows={stats.recentRequests}
            pagination={false}
            empty="No blood requests yet"
          />
        </div>
        <div className="min-w-0 space-y-5">
          {/* <Card className="p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold">Pending Approvals</p>
              <Status tone="warning">{pending.length}</Status>
            </div>
            {pending.length ? (
              <ul className="space-y-3">
                {pending.map((p) => (
                  <li key={p.id} className="rounded-2xl bg-surface p-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={p.author} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {p.author}
                        </p>
                        <p className="text-xs text-ink-soft">{p.time}</p>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm">{p.text}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button size="sm" onClick={() => done(p.id)}>
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => done(p.id)}
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-ink-soft">
                All caught up 🎉
              </p>
            )}
          </Card> */}
          <Card className="p-4 sm:p-5">
            <p className="mb-4 flex items-center gap-2 font-bold">
              <Activity className="h-4 w-4 text-brand-600" />
              Recent Activity
            </p>
            <ul className="space-y-4">
              {!stats.activity.length && <li className="text-sm text-ink-soft">No activity yet.</li>}
              {stats.activity.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{a.title}</p>
                    <p className="break-words text-sm text-ink-soft">{a.detail}</p>
                    <p className="text-xs text-gray-400">{ago(a.at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
