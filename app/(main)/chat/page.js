"use client";
import { useState } from "react";
import { ArrowLeft, Paperclip, Smile, Send, Search } from "lucide-react";
import { Avatar, Card } from "@/components/ui";
import { chats } from "@/data";
import { cn } from "@/lib/cn";

export default function Chat() {
  const [active, setActive] = useState(null); // mobile view toggle
  const c = chats.find((x) => x.id === (active ?? chats[0].id));
  return (
    <Card className="mx-auto grid h-[calc(100dvh-11rem)] max-w-5xl overflow-hidden lg:h-[calc(100dvh-7.5rem)] md:grid-cols-[320px_1fr]">
      <section className={cn("flex-col border-r border-gray-100", active ? "hidden md:flex" : "flex")}>
        <div className="p-4"><p className="mb-3 text-lg font-bold">মেসেজ</p>
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input className="h-10 w-full rounded-full bg-surface pl-9 text-sm" placeholder="খুঁজুন" /></div>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {chats.map((x) => (
            <li key={x.id}>
              <button onClick={() => setActive(x.id)} className={cn("flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50", c.id === x.id && "md:bg-brand-50")}>
                <Avatar name={x.name} online={x.online} />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between"><p className="truncate font-semibold">{x.name}</p><span className="text-xs text-ink-soft">{x.time}</span></div>
                  <p className={cn("truncate text-sm", x.unread ? "font-semibold text-ink" : "text-ink-soft")}>{x.last}</p>
                </div>
                {x.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">{x.unread}</span>}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={cn("min-h-0 flex-col", active ? "flex" : "hidden md:flex")}>
        <div className="flex items-center gap-3 border-b border-gray-100 p-3">
          <button onClick={() => setActive(null)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 md:hidden"><ArrowLeft className="h-5 w-5" /></button>
          <Avatar name={c.name} size="sm" online={c.online} />
          <div><p className="text-sm font-semibold leading-tight">{c.name}</p><p className="text-xs text-ink-soft">{c.online ? "অনলাইন" : "অফলাইন"}</p></div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto bg-surface p-4">
          {c.messages.map((m, i) => (
            <div key={i} className={cn("flex", m.from === "me" && "justify-end")}>
              <div className={cn("max-w-[78%] rounded-2xl px-3.5 py-2 text-sm", m.from === "me" ? "rounded-br-md bg-brand-600 text-white" : "rounded-bl-md bg-white shadow-sm")}>
                {m.text}<p className={cn("mt-0.5 text-[10px]", m.from === "me" ? "text-brand-100" : "text-gray-400")}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-gray-100 p-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-gray-100"><Paperclip className="h-5 w-5" /></button>
          <input className="h-10 flex-1 rounded-full bg-surface px-4 text-sm focus:ring-2 focus:ring-brand-200" placeholder="মেসেজ লিখুন..." />
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-gray-100"><Smile className="h-5 w-5" /></button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white"><Send className="h-4 w-4" /></button>
        </div>
      </section>
    </Card>
  );
}
