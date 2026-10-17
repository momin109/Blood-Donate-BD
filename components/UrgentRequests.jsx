"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Siren } from "lucide-react";
import { BloodBadge, Card } from "@/components/ui";
import { api } from "@/lib/client";

const RANK = { "Very Urgent": 2, Urgent: 1, Normal: 0 };

// সাইডবারে জরুরি অনুরোধ (GET /api/requests) — Fulfilled বাদ, সবচেয়ে জরুরিগুলো আগে
export default function UrgentRequests() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let off = false;
    api("/api/requests", { params: { limit: 20 } })
      .then((d) => {
        if (off) return;
        const open = d.items.filter((r) => r.status !== "Fulfilled");
        setItems(open.sort((a, b) => RANK[b.urgency] - RANK[a.urgency]).slice(0, 3));
      })
      .catch(() => !off && setItems([]));
    return () => {
      off = true;
    };
  }, []);

  return (
    <Card className="sticky top-24 p-5">
      <p className="mb-4 flex items-center gap-2 font-bold">
        <Siren className="h-5 w-5 text-brand-600" />
        Urgent Requests
      </p>
      {items === null ? (
        <p className="text-sm text-ink-soft">লোড হচ্ছে…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-soft">এখন কোনো খোলা অনুরোধ নেই।</p>
      ) : (
        <ul className="space-y-4">
          {items.map((r) => (
            <li key={r.id} className="flex items-center gap-3">
              <BloodBadge group={r.bloodGroup} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{r.patientName}</p>
                <p className="truncate text-xs text-ink-soft">{r.hospital}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link href="/requests" className="mt-5 block text-sm font-semibold text-brand-600 hover:underline">
        View all requests →
      </Link>
    </Card>
  );
}
