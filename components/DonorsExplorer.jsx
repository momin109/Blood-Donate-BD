"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Users, ShieldCheck, Flame, ChevronDown } from "lucide-react";
import DonorCard from "@/components/DonorCard";
import { api } from "@/lib/client";
import { DIVISIONS, DIVISION_NAMES } from "@/data/locations";

const GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const AVAILABILITY_OPTIONS = [
  { value: "", label: "All" },
  { value: "available", label: "available" },
  { value: "unavailable", label: "unavailable" },
];

function SelectBox({ label, value, onChange, options }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-sm font-bold text-gray-800">{label}</p>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 pl-4 pr-9 text-sm font-semibold text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, iconBg, iconColor, valueColor }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-red-50 bg-white px-2 py-4 text-center shadow-[0_6px_24px_rgba(0,0,0,0.05)]">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}
      >
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </span>
      <p className={`mt-2 text-xl font-extrabold leading-none ${valueColor}`}>
        {value}
      </p>
      <p className="mt-2 text-xs font-medium leading-tight text-gray-500">
        {label}
      </p>
    </div>
  );
}

const PAGE_SIZE = 12;

export default function DonorsExplorer({ upazilas = [] }) {
  const [group, setGroup] = useState("A+");
  const [division, setDivision] = useState("ঢাকা");
  const [district, setDistrict] = useState("ঢাকা");
  const [upazila, setUpazila] = useState("");
  const [availability, setAvailability] = useState("");
  // সার্চ বাটনে ক্লিক করলে তবেই ফিল্টার apply হবে (শুরুতে সব ডোনার)
  const [applied, setApplied] = useState({});

  const [donors, setDonors] = useState([]);
  const [pg, setPg] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ total: 0, available: 0, urgent: 0 });

  // GET /api/donors
  const fetchDonors = useCallback(async (filters, page, append) => {
    setLoading(true);
    setError("");
    try {
      const d = await api("/api/donors", {
        params: { ...filters, page, limit: PAGE_SIZE },
      });
      setDonors((prev) => (append ? [...prev, ...d.items] : d.items));
      setPg(d.pagination);
    } catch (e) {
      setError(e.message);
      if (!append) setDonors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonors(applied, 1, false);
  }, [applied, fetchDonors]);

  // উপরের stat কার্ড: মোট ডোনার / available / জরুরি অনুরোধ
  useEffect(() => {
    const count = (url, params) =>
      api(url, { params: { ...params, limit: 1 } })
        .then((d) => d.pagination.total)
        .catch(() => 0);
    Promise.all([
      count("/api/donors"),
      count("/api/donors", { available: "true" }),
      count("/api/requests", { urgency: "Urgent" }),
      count("/api/requests", { urgency: "Very Urgent" }),
    ]).then(([total, available, u1, u2]) =>
      setStats({ total, available, urgent: u1 + u2 }),
    );
  }, []);

  const districtList = useMemo(
    () =>
      division ? DIVISIONS[division] || [] : Object.values(DIVISIONS).flat(),
    [division],
  );
  const upazilaList = useMemo(
    () =>
      [...new Set([...upazilas, ...donors.map((d) => d.upazila)])].filter(
        Boolean,
      ),
    [upazilas, donors],
  );

  const divisionOptions = [
    { value: "", label: "সকল বিভাগ" },
    ...DIVISION_NAMES.map((x) => ({ value: x, label: x })),
  ];
  const districtOptions = [
    { value: "", label: "সকল জেলা" },
    ...districtList.map((x) => ({ value: x, label: x })),
  ];
  const upazilaOptions = [
    { value: "", label: "সকল উপজেলা" },
    ...upazilaList.map((x) => ({ value: x, label: x })),
  ];

  const handleDivision = (v) => {
    setDivision(v);
    setDistrict("");
    setUpazila("");
  };
  const handleDistrict = (v) => {
    setDistrict(v);
    setUpazila("");
  };

  const search = () =>
    setApplied({
      bloodGroup: group,
      division,
      district,
      upazila,
      available:
        availability === "available"
          ? "true"
          : availability === "unavailable"
            ? "false"
            : "",
    });

  /*
   * Mobile (<768)  : আগের মতোই, কোনো পরিবর্তন নেই
   * Tablet (768+)  : সার্চ কার্ড উপরে full-width (গ্রুপ ১ সারিতে, ফিল্টার ৪ কলামে), নিচে ২ কলাম ডোনার
   * Laptop/PC (1280+): বামে sticky সাইডবার (মোবাইলের মতো compact), ডানে ডোনার লিস্ট
   *                    (২ কলাম, 1536+ এ ৩ কলাম) — এতে কার্ডের লেখা এক লাইনেই থাকে
   */
  return (
    <div className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
      {/* Left column: search card + stats */}
      <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-[32px] border border-red-100 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] md:p-6 xl:p-5">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100">
                <Search className="h-5 w-5 text-red-600" />
              </span>
              <p className="truncate text-lg font-extrabold text-gray-900">
                দ্রুত রক্তদাতা সার্চ
              </p>
            </div>
            <p className="shrink-0 text-xs text-gray-400">সহজ ধাপে খুঁজুন</p>
          </div>

          {/* Step 1: Blood group */}
          <p className="mb-3 mt-5 text-sm font-bold text-gray-800">
            ১. রক্তের গ্রুপ নির্বাচন করুন:
          </p>
          <div className="grid grid-cols-4 gap-2 md:grid-cols-8 xl:grid-cols-4">
            {GROUPS.map((g) => {
              const active = group === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroup(active ? "" : g)}
                  className={`h-11 rounded-2xl border text-base font-extrabold transition ${
                    active
                      ? "border-red-600 bg-red-600 text-white shadow-sm ring-2 ring-red-300 ring-offset-1"
                      : "border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>

          {/* Step 2-5: Division, District, Upazila, Availability */}
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-2">
            <SelectBox
              label="২. বিভাগ:"
              value={division}
              onChange={handleDivision}
              options={divisionOptions}
            />
            <SelectBox
              label="৩. জেলা:"
              value={district}
              onChange={handleDistrict}
              options={districtOptions}
            />
            <SelectBox
              label="৪. উপজেলা:"
              value={upazila}
              onChange={setUpazila}
              options={upazilaOptions}
            />
            <SelectBox
              label="৫. Availability:"
              value={availability}
              onChange={setAvailability}
              options={AVAILABILITY_OPTIONS}
            />
          </div>

          {/* Search button */}
          <button
            type="button"
            onClick={search}
            disabled={loading}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 text-base font-extrabold text-white shadow-lg shadow-red-200 transition hover:bg-red-700 disabled:opacity-60 md:mx-auto md:max-w-sm xl:max-w-none"
          >
            <Search className="h-5 w-5" />
            <span>ডোনার খুঁজুন{group ? ` (${group})` : ""}</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard
            icon={Users}
            value={stats.total}
            label="নিবন্ধিত ডোনার"
            iconBg="bg-red-100"
            iconColor="text-red-600"
            valueColor="text-gray-900"
          />
          <StatCard
            icon={ShieldCheck}
            value={stats.available}
            label="প্রস্তুত রক্তদাতা"
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            valueColor="text-emerald-600"
          />
          <StatCard
            icon={Flame}
            value={stats.urgent}
            label="জরুরি অনুরোধ"
            iconBg="bg-amber-100"
            iconColor="text-amber-500"
            valueColor="text-amber-500"
          />
        </div>
      </div>

      {/* Donor list */}
      <div className="min-w-0">
        <p className="mb-3 px-1 text-sm text-gray-500">
          {loading && !donors.length
            ? "লোড হচ্ছে…"
            : `${pg.total} জন রক্তদাতা পাওয়া গেছে`}
        </p>

        {error ? (
          <div className="rounded-3xl border border-red-100 bg-white p-8 text-center text-red-600">
            {error}
            <button
              onClick={() => fetchDonors(applied, 1, false)}
              className="ml-2 font-bold underline"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : !loading && donors.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center text-gray-500">
            কোনো রক্তদাতা পাওয়া যায়নি। ফিল্টার বদলে আবার চেষ্টা করুন।
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {donors.map((d) => (
                <DonorCard key={d.id} donor={d} />
              ))}
            </div>
            {pg.page < pg.totalPages && (
              <button
                type="button"
                onClick={() => fetchDonors(applied, pg.page + 1, true)}
                disabled={loading}
                className="mx-auto mt-5 flex h-12 items-center justify-center rounded-2xl border-2 border-red-600 bg-white px-8 font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                {loading ? "লোড হচ্ছে…" : "আরও দেখুন"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
