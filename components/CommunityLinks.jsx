import {
  MessageCircle,
  Facebook,
  MessagesSquare,
  Send,
  Linkedin,
  Youtube,
  Instagram,
  Music2,
} from "lucide-react";
import { Card } from "@/components/ui";
import { contact, company } from "@/data";

const X = () => (
  <span className="text-lg font-black leading-none sm:text-xl">X</span>
);
const items = [
  [MessageCircle, "Join our WhatsApp", "bg-[#25D366]", contact.whatsapp],
  [Facebook, "Follow us on Facebook", "bg-[#1877F2]", contact.facebook],
  [MessagesSquare, "Chat on Messenger", "bg-[#0A7CFF]", contact.messenger],
  [Send, "Join our Telegram", "bg-[#229ED9]", contact.telegram],
  [X, "Follow us on X", "bg-black", contact.x],
  [Linkedin, "Follow us on LinkedIn", "bg-[#0A66C2]", contact.linkedin],
  [Youtube, "Subscribe on YouTube", "bg-[#FF0000]", contact.youtube],
  [Music2, "Follow us on TikTok", "bg-black", contact.tiktok],
  [
    Instagram,
    "Follow us on Instagram",
    "bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5]",
    contact.instagram,
  ],
];

export default function CommunityLinks() {
  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-5 text-center">
        <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {company.name}
        </p>
        <p className="mt-0.5 text-sm text-ink-soft">Our Community</p>
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {items.map(([Icon, label, c, href]) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 flex-col items-center gap-2.5 rounded-2xl border border-gray-100 bg-white p-2.5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-card sm:gap-3 sm:p-5"
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md sm:h-14 sm:w-14 sm:rounded-2xl ${c}`}
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            <span className="text-[11px] font-semibold leading-tight sm:text-sm">
              {label}
            </span>
          </a>
        ))}
      </div>
    </Card>
  );
}
