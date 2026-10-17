"use client";
import Link from "next/link";
import {
  Clock,
  MapPin,
  CheckCircle2,
  Trash2,
  Phone,
  MessageCircle,
  Building2,
  Calendar,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import { formatDateTime, timeAgo } from "@/lib/format";

const URGENCY_STYLE = {
  Normal: "bg-amber-50 text-amber-700",
  Urgent: "bg-orange-100 text-orange-700",
  "Very Urgent": "bg-red-100 text-red-700",
};

function Row({ label, value, valueClass = "text-gray-900" }) {
  return (
    <div className="grid grid-cols-2 gap-3 border-b border-gray-200 px-4 py-3 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`break-words text-sm font-bold ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

// API-র BloodRequest object সরাসরি নেয় (GET /api/requests)
export default function RequestCard({ request: r, onFulfill, onDelete }) {
  const poster = r.requester?.name || r.patientName || "?";
  const bags = r.bags || 1;
  const location = [r.district, r.upazila].filter(Boolean).join(", ");
  const fulfilled = r.status === "Fulfilled";

  return (
    <Card className="min-w-0 overflow-hidden rounded-[28px] border border-gray-100 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-lg font-extrabold text-white">
          {poster.charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-extrabold text-gray-900">{poster}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {timeAgo(r.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {location}
            </span>
          </div>
        </div>

        {fulfilled ? (
          <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Fulfilled</span>
        ) : (
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${URGENCY_STYLE[r.urgency] || URGENCY_STYLE.Normal}`}>
            {r.urgency}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="mt-3 text-sm leading-6 text-gray-800 sm:text-base">
        {r.details || `${bags} ব্যাগ ${r.bloodGroup} রক্ত লাগবে`}
      </p>

      {/* Table: মূল তথ্য */}
      <div className="mt-3 overflow-hidden rounded-2xl bg-gray-50 ring-1 ring-gray-100">
        <Row label="Patient" value={`${r.patientName}${r.age != null ? ` (${r.age} বছর)` : ""}`} />
        <Row label="Problem" value={r.reason} />
        <Row label="Hemoglobin" value={r.hemoglobin ? `${r.hemoglobin}` : "জানা নেই"} />
        <Row label="Blood Group" value={r.bloodGroup} valueClass="text-red-600" />
        <Row label="Bags" value={`${bags} bag(s)`} />
      </div>

      {/* Text: হাসপাতাল, লোকেশন, তারিখ */}
      <div className="mt-3 flex flex-col gap-2 text-sm leading-5 text-gray-600 sm:text-base">
        <p className="flex items-start gap-2">
          <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
          <span className="break-words font-medium text-gray-800">{r.hospital}</span>
        </p>
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
          <span className="break-words">{[r.division, r.district, r.upazila].filter(Boolean).join(", ")}</span>
        </p>
        <p className="flex items-start gap-2">
          <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
          <span className="break-words">{formatDateTime(r.neededAt)}</span>
        </p>
      </div>

      {/* Call + Chat (contactPhone শুধু logged-in user-কে API পাঠায়) */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <a href={r.contactPhone ? `tel:${r.contactPhone}` : "/login"} className="min-w-0">
          <Button className="!h-11 w-full !rounded-2xl !border-red-600 !bg-red-600 !px-2 !text-sm !font-bold !text-white shadow-sm hover:!border-red-700 hover:!bg-red-700">
            <Phone className="h-4 w-4 shrink-0" />
            <span>{r.contactPhone ? "Call Now" : "Login to Call"}</span>
          </Button>
        </a>

        <Link href={r.requester?.id && !r.isOwner ? `/chat?to=${r.requester.id}` : "/chat"} className="min-w-0">
          <Button
            variant="outline"
            className="!h-11 w-full !rounded-2xl !border-2 !border-red-600 !bg-white !px-2 !text-sm !font-bold !text-red-600 hover:!bg-red-50"
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span>Chat</span>
          </Button>
        </Link>
      </div>

      {/* মালিকের জন্য: Fulfilled চিহ্নিত করা / মুছে ফেলা */}
      {r.isOwner && (
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
          {!fulfilled ? (
            <Button variant="soft" size="sm" onClick={() => onFulfill?.(r.id)}>
              <CheckCircle2 className="h-4 w-4" /> Fulfilled
            </Button>
          ) : (
            <span />
          )}
          <Button variant="outline" size="sm" onClick={() => onDelete?.(r.id)}>
            <Trash2 className="h-4 w-4" /> মুছে ফেলুন
          </Button>
        </div>
      )}
    </Card>
  );
}
