import Link from "next/link";
import {
  Clock,
  Bookmark,
  Bell,
  Award,
  LifeBuoy,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui";
import DeveloperInfo from "@/components/DeveloperInfo";
import CommunityLinks from "@/components/CommunityLinks";

// ID Card এখন আলাদা বাটন, তাই এখানে রাখা হয়নি
const menu = [
  [Clock, "My Donation History", "/donations"],
  [Bookmark, "Saved Requests", "/requests"],
  [Bell, "Notification Settings", "/notifications"],
  [Award, "Awards & Badges", "/top-donors"],
  [LifeBuoy, "Help & Support", "/me"],
  [Settings, "Settings", "/me"],
];

// Menu বাটনে ক্লিক করলে এই পুরো অংশ দেখাবে
export default function ProfileMenuPanel() {
  return (
    <div className="space-y-5">
      {/* ১. Menu list */}
      <Card className="p-2">
        <p className="px-3 pb-1 pt-3 text-lg font-bold">Menu</p>
        {menu.map(([Icon, label, href]) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 rounded-2xl px-3 py-3.5 hover:bg-surface"
          >
            <Icon className="h-5 w-5 text-ink-soft" />
            <span className="flex-1 text-[15px] font-medium">{label}</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
        ))}
      </Card>

      {/* ২. Developer Information */}
      <DeveloperInfo />

      {/* ৩. Our Community */}
      <CommunityLinks />
    </div>
  );
}
