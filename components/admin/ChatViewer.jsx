"use client";
import { useEffect, useState } from "react";
import DetailsDrawer from "@/components/admin/DetailsDrawer";
import { dDateTime } from "@/components/admin/fmt";
import { Status } from "@/components/ui";
import { statusTone } from "@/data/admin";
import { api } from "@/lib/client";
import { cn } from "@/lib/cn";

// Admin-এর জন্য একটি conversation-এর মেসেজ দেখার slide-over (শুধু পড়া)
export default function ChatViewer({ id, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let off = false;
    setData(null);
    setError("");
    api(`/api/admin/chats/${id}`)
      .then((d) => !off && setData(d))
      .catch((e) => !off && setError(e.message));
    return () => {
      off = true;
    };
  }, [id]);

  const people = data?.conversation.participants ?? [];
  const firstId = people[0]?.id;
  return (
    <DetailsDrawer
      open={!!id}
      onClose={onClose}
      title={people.length ? people.map((p) => p.name).join(" ↔ ") : "Conversation"}
      subtitle={data ? `${data.conversation.totalMessages} message(s)${data.conversation.locked ? " · Locked" : ""}` : undefined}
    >
      {error && <p role="alert" className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{error}</p>}
      {!data && !error && <p className="py-10 text-center text-sm text-ink-soft">Loading…</p>}
      {data && (
        <>
          {data.reports.length > 0 && (
            <div className="space-y-2 rounded-2xl bg-brand-50 p-4 text-sm">
              <p className="font-semibold text-brand-700">Reports</p>
              {data.reports.map((r) => (
                <p key={r.id} className="flex flex-wrap items-center gap-x-2">
                  <Status tone={statusTone[r.status]}>{r.status}</Status>
                  <span className="min-w-0 break-words"><b>{r.by}:</b> {r.reason}</span>
                </p>
              ))}
            </div>
          )}
          {data.conversation.totalMessages > data.messages.length && (
            <p className="text-center text-xs text-ink-soft">Showing the latest {data.messages.length} messages</p>
          )}
          <div className="space-y-3 rounded-2xl bg-surface p-3">
            {data.messages.length === 0 && <p className="py-6 text-center text-sm text-ink-soft">No messages</p>}
            {data.messages.map((m) => (
              <div key={m.id} className={cn("flex", m.senderId !== firstId && "justify-end")}>
                <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2 text-sm", m.senderId === firstId ? "rounded-bl-md bg-white shadow-sm" : "rounded-br-md bg-brand-600 text-white")}>
                  <p className={cn("mb-0.5 text-[11px] font-semibold", m.senderId === firstId ? "text-ink-soft" : "text-brand-100")}>{m.senderName}</p>
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={cn("mt-0.5 text-[10px]", m.senderId === firstId ? "text-gray-400" : "text-brand-100")}>{dDateTime(m.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </DetailsDrawer>
  );
}
