"use client";

import Link from "next/link";
import { MapPin, CalendarDays, Phone, MessageCircle } from "lucide-react";

import { Avatar, Button, Card } from "@/components/ui";
import { FavButton } from "@/components/Favorites";
import RankBadge from "@/components/RankBadge";
import { BADGES } from "@/lib/badges";
import { formatDate } from "@/lib/format";

export default function DonorCard({ donor: d }) {
  return (
    <Card
      // Top ১০ ডোনারের card-এ badge-এর রঙের border
      style={BADGES[d.badge] ? { borderColor: BADGES[d.badge].from, boxShadow: `0 8px 30px ${BADGES[d.badge].from}40` } : undefined}
      className="min-w-0 overflow-hidden rounded-[24px] border border-gray-100 bg-white !px-4 !py-2 shadow-[0_8px_30px_rgba(0,0,0,0.07)] sm:!px-5 sm:!py-3"
    >
      <div className="flex items-start gap-3 sm:gap-5">
        {/* Donor Photo (fully round, top aligned) */}
        <Link
          href={`/donors/${d.id}`}
          className="relative mt-0.5 shrink-0"
          aria-label={`View ${d.name}'s profile`}
        >
          {/* Top Donor crown badge: ছবির কোণায় (ডান কোণায় রক্তের গ্রুপ ও favorite আছে) */}
          <RankBadge badge={d.badge} size="xs" className="absolute -left-1.5 -top-1.5 z-10" />
          <Avatar name={d.name} src={d.photo} className="[&>span:first-child]:h-[52px] [&>span:first-child]:w-[52px] sm:[&>span:first-child]:h-20 sm:[&>span:first-child]:w-20 sm:[&>span:first-child]:text-3xl" />
        </Link>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          {/* Top row: Name (left) + Blood Group & Favorite (right) */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/donors/${d.id}`}
              className="min-w-0 break-words text-lg font-extrabold leading-tight tracking-tight text-gray-900 hover:underline sm:text-2xl"
            >
              {d.name}
            </Link>

            <div className="flex shrink-0 items-center gap-1.5">
              <span className="inline-flex items-center justify-center rounded-md bg-red-600 px-2 py-0.5 text-sm font-extrabold leading-none text-white shadow-sm sm:text-lg">
                {d.bloodGroup}
              </span>
              <div className="-my-1.5">
                <FavButton id={d.id} donor={d} />
              </div>
            </div>
          </div>

          {/* Availability + Location + Last donated */}
          <div className="mt-1.5 flex flex-col gap-1.5">
            {/* Availability */}
            <p
              className={`flex items-center gap-2 text-sm font-bold leading-5 sm:text-base ${
                d.available ? "text-emerald-600" : "text-gray-500"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  d.available ? "bg-emerald-500" : "bg-gray-400"
                }`}
              />
              <span>{d.available ? "Available" : "Unavailable"}</span>
            </p>

            {/* Location */}
            <p className="flex items-center gap-2 text-sm leading-5 text-gray-600 sm:text-base">
              <MapPin className="h-[18px] w-[18px] shrink-0 text-gray-500 sm:h-5 sm:w-5" />
              <span className="break-words">
                {d.district}, {d.upazila}
              </span>
            </p>

            {/* Last Donation */}
            <p className="flex items-center gap-2 text-sm leading-5 text-gray-600 sm:text-base">
              <CalendarDays className="h-[18px] w-[18px] shrink-0 text-gray-500 sm:h-5 sm:w-5" />
              <span className="min-w-0 break-words">
                Last donated:{" "}
                <span className="font-medium text-gray-700">{d.lastDonationDate ? formatDate(d.lastDonationDate) : "এখনও দেননি"}</span>
              </span>
            </p>
          </div>

          {/* Call + Chat */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
            {/* phone শুধু logged-in user-কে API পাঠায়; না থাকলে login-এ পাঠানো হয় */}
            <a href={d.phone ? `tel:${d.phone}` : "/login"} className="min-w-0">
              <Button className="!h-9 w-full !rounded-xl !border-red-600 !bg-red-600 !px-2 !text-sm !font-bold !text-white shadow-sm hover:!border-red-700 hover:!bg-red-700 sm:!h-12 sm:!rounded-2xl sm:!text-base">
                <Phone className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span>{d.phone ? "Call Now" : "Login to Call"}</span>
              </Button>
            </a>

            <Link href={`/chat?to=${d.id}`} className="min-w-0">
              <Button
                variant="outline"
                className="!h-9 w-full !rounded-xl !border-2 !border-red-600 !bg-white !px-2 !text-sm !font-bold !text-red-600 hover:!bg-red-50 sm:!h-12 sm:!rounded-2xl sm:!text-base"
              >
                <MessageCircle className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span>Chat</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
