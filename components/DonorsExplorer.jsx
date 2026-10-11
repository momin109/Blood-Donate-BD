"use client";

import { useMemo, useState } from "react";
import { Search, Users, ShieldCheck, Flame, ChevronDown } from "lucide-react";
import DonorCard from "@/components/DonorCard";

const GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

// বিভাগ → জেলা (বানান তোমার data-র সাথে মিলতে হবে)
const DIVISIONS = {
  ঢাকা: [
    "ঢাকা",
    "গাজীপুর",
    "নারায়ণগঞ্জ",
    "নরসিংদী",
    "মানিকগঞ্জ",
    "মুন্সিগঞ্জ",
    "কিশোরগঞ্জ",
    "টাঙ্গাইল",
    "ফরিদপুর",
    "মাদারীপুর",
    "শরীয়তপুর",
    "রাজবাড়ী",
    "গোপালগঞ্জ",
  ],
  চট্টগ্রাম: [
    "চট্টগ্রাম",
    "কক্সবাজার",
    "কুমিল্লা",
    "ব্রাহ্মণবাড়িয়া",
    "চাঁদপুর",
    "নোয়াখালী",
    "ফেনী",
    "লক্ষ্মীপুর",
    "রাঙ্গামাটি",
    "খাগড়াছড়ি",
    "বান্দরবান",
  ],
  রাজশাহী: [
    "রাজশাহী",
    "নাটোর",
    "নওগাঁ",
    "চাঁপাইনবাবগঞ্জ",
    "পাবনা",
    "সিরাজগঞ্জ",
    "বগুড়া",
    "জয়পুরহাট",
  ],
  খুলনা: [
    "খুলনা",
    "বাগেরহাট",
    "সাতক্ষীরা",
    "যশোর",
    "নড়াইল",
    "মাগুরা",
    "ঝিনাইদহ",
    "কুষ্টিয়া",
    "চুয়াডাঙ্গা",
    "মেহেরপুর",
  ],
  বরিশাল: ["বরিশাল", "ভোলা", "পটুয়াখালী", "পিরোজপুর", "ঝালকাঠি", "বরগুনা"],
  সিলেট: ["সিলেট", "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ"],
  রংপুর: [
    "রংপুর",
    "দিনাজপুর",
    "গাইবান্ধা",
    "কুড়িগ্রাম",
    "লালমনিরহাট",
    "নীলফামারী",
    "পঞ্চগড়",
    "ঠাকুরগাঁও",
  ],
  ময়মনসিংহ: ["ময়মনসিংহ", "জামালপুর", "নেত্রকোণা", "শেরপুর"],
};

const AVAILABILITY_OPTIONS = [
  { value: "", label: "সব" },
  { value: "available", label: "উপলব্ধ" },
  { value: "unavailable", label: "অনুপলব্ধ" },
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
        className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg}`}
      >
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </span>
      <p className={`mt-2 text-3xl font-extrabold leading-none ${valueColor}`}>
        {value}
      </p>
      <p className="mt-2 text-xs font-medium leading-tight text-gray-500">
        {label}
      </p>
    </div>
  );
}

export default function DonorsExplorer({
  donors,
  districts,
  upazilas,
  urgentRequests = 0,
}) {
  const [group, setGroup] = useState("A+");
  const [division, setDivision] = useState("ঢাকা");
  const [district, setDistrict] = useState(
    districts.includes("ঢাকা") ? "ঢাকা" : "",
  );
  const [upazila, setUpazila] = useState("");
  const [availability, setAvailability] = useState("");
  // সার্চ বাটনে ক্লিক করলে তবেই ফিল্টার apply হবে
  const [applied, setApplied] = useState(null);

  // বিভাগ অনুযায়ী জেলার তালিকা
  const districtList = useMemo(() => {
    if (!division) return districts;
    const inDivision = districts.filter((x) =>
      (DIVISIONS[division] || []).includes(x),
    );
    return inDivision.length ? inDivision : districts;
  }, [division, districts]);

  // জেলা অনুযায়ী উপজেলার তালিকা (ডোনারদের data থেকে)
  const upazilaList = useMemo(() => {
    if (!district) return upazilas;
    const fromDonors = [
      ...new Set(
        donors.filter((d) => d.district === district).map((d) => d.upazila),
      ),
    ].filter(Boolean);
    return fromDonors.length ? fromDonors : upazilas;
  }, [district, donors, upazilas]);

  const divisionOptions = [
    { value: "", label: "সকল বিভাগ" },
    ...Object.keys(DIVISIONS).map((x) => ({ value: x, label: x })),
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

  const filtered = useMemo(() => {
    if (!applied) return donors;
    const divisionDistricts = applied.division
      ? DIVISIONS[applied.division] || []
      : null;

    return donors.filter((d) => {
      if (applied.group && d.group !== applied.group) return false;

      if (applied.district) {
        if (d.district !== applied.district) return false;
      } else if (applied.division) {
        const inDivision =
          d.division === applied.division ||
          divisionDistricts.includes(d.district);
        if (!inDivision) return false;
      }

      if (applied.upazila && d.upazila !== applied.upazila) return false;
      if (applied.availability === "available" && !d.available) return false;
      if (applied.availability === "unavailable" && d.available) return false;
      return true;
    });
  }, [donors, applied]);

  const availableCount = donors.filter((d) => d.available).length;

  return (
    <div className="grid gap-5 lg:grid-cols-[330px_1fr]">
      {/* Left column: search card + stats */}
      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[32px] border border-red-100 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
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
          <div className="grid grid-cols-4 gap-2">
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
          <div className="mt-5 grid grid-cols-2 gap-3">
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
            onClick={() =>
              setApplied({ group, division, district, upazila, availability })
            }
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 text-base font-extrabold text-white shadow-lg shadow-red-200 transition hover:bg-red-700"
          >
            <Search className="h-5 w-5" />
            <span>ডোনার খুঁজুন{group ? ` (${group})` : ""}</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard
            icon={Users}
            value={donors.length}
            label="নিবন্ধিত ডোনার"
            iconBg="bg-red-100"
            iconColor="text-red-600"
            valueColor="text-gray-900"
          />
          <StatCard
            icon={ShieldCheck}
            value={availableCount}
            label="প্রস্তুত রক্তদাতা"
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            valueColor="text-emerald-600"
          />
          <StatCard
            icon={Flame}
            value={urgentRequests}
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
          {filtered.length} জন রক্তদাতা পাওয়া গেছে
        </p>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center text-gray-500">
            কোনো রক্তদাতা পাওয়া যায়নি। ফিল্টার বদলে আবার চেষ্টা করুন।
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((d) => (
              <DonorCard key={d.id} donor={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
