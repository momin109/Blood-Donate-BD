"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Heart,
  UserRound,
  Phone,
  MessageCircle,
  Facebook,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import ProfileView from "@/components/ProfileView";
import ProfileActions from "@/components/ProfileActions";
import ProfileMenuPanel from "@/components/ProfileMenuPanel";
import { useFavs, FavButton } from "@/components/Favorites";
import {
  Avatar,
  Button,
  Card,
  Status,
  Switch,
  BloodBadge,
  statusTone,
} from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/client";

const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="20" fill="#fff" />
    <path
      fill="#25D366"
      d="M24 6C14.06 6 6 14.06 6 24c0 3.4.95 6.58 2.6 9.3L6 42l8.9-2.55A17.9 17.9 0 0 0 24 42c9.94 0 18-8.06 18-18S33.94 6 24 6zm0 32.5c-2.9 0-5.6-.84-7.88-2.28l-.57-.34-5.28 1.51 1.54-5.1-.37-.6A14.43 14.43 0 0 1 9.5 24C9.5 16.07 16.07 9.5 24 9.5S38.5 16.07 38.5 24 31.93 38.5 24 38.5z"
    />
    <path
      fill="#25D366"
      d="M31.4 27.9c-.4-.2-2.4-1.2-2.8-1.3-.4-.15-.65-.2-.93.2-.27.4-1.06 1.3-1.3 1.57-.24.27-.48.3-.88.1-.4-.2-1.7-.63-3.23-2-1.2-1.07-2-2.38-2.23-2.78-.23-.4-.02-.62.18-.82.18-.18.4-.48.6-.72.2-.24.27-.4.4-.67.13-.27.07-.5-.03-.7-.1-.2-.93-2.2-1.27-3-.33-.8-.67-.7-.93-.7h-.8c-.27 0-.7.1-1.07.5-.37.4-1.4 1.37-1.4 3.33s1.43 3.87 1.63 4.13c.2.27 2.8 4.27 6.8 5.97.95.4 1.7.65 2.27.83.95.3 1.82.26 2.5.16.77-.12 2.4-.98 2.73-1.93.33-.95.33-1.76.23-1.93-.1-.17-.37-.27-.77-.47z"
    />
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#1877F2"
      d="M13.5 22v-8.2h2.8l.5-3.4h-3.3V8.3c0-1 .3-1.7 1.7-1.7h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.6H7.4v3.4h2.8V22h3.3z"
    />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FEDA75" />
        <stop offset="30%" stopColor="#FA7E1E" />
        <stop offset="55%" stopColor="#D62976" />
        <stop offset="80%" stopColor="#962FBF" />
        <stop offset="100%" stopColor="#4F5BD5" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#igGrad)" />
    <circle
      cx="12"
      cy="12"
      r="4.6"
      fill="none"
      stroke="#fff"
      strokeWidth="1.8"
    />
    <circle cx="17.4" cy="6.6" r="1.2" fill="#fff" />
  </svg>
);

const socialLinks = [
  {
    name: "Call",
    href: "tel:",
    circle: "bg-[#E10B17] text-white hover:bg-[#c40a14]",
    icon: (
      <Phone
        className="h-7 w-7 sm:h-9 sm:w-9"
        fill="currentColor"
        strokeWidth={0}
      />
    ),
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/",
    circle: "bg-[#F9D3D3] hover:bg-[#F5BFBF]",
    icon: <WhatsAppIcon className="h-9 w-9 sm:h-12 sm:w-12" />,
  },
  {
    name: "Facebook",
    href: "https://facebook.com/",
    circle: "bg-[#FCE4E4] hover:bg-[#F9D3D3]",
    icon: <FacebookIcon className="h-9 w-9 sm:h-12 sm:w-12" />,
  },
  {
    name: "Instagram",
    href: "https://instagram.com/",
    circle: "bg-[#FCE4E4] hover:bg-[#F9D3D3]",
    icon: <InstagramIcon className="h-9 w-9 sm:h-12 sm:w-12" />,
  },
];

export default function MyProfile() {
  const router = useRouter();
  const { user, loading, logout, updateProfile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false); // ডিফল্টভাবে hidden
  const { favDonors: favDonorList } = useFavs();
  const [myRequests, setMyRequests] = useState([]);
  const [reqError, setReqError] = useState("");

  // login না থাকলে login পেজে পাঠানো
  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/me");
  }, [loading, user, router]);

  // GET /api/requests?mine=true
  const loadMine = useCallback(async () => {
    try {
      const d = await api("/api/requests", {
        params: { mine: "true", limit: 10 },
      });
      setMyRequests(d.items);
    } catch (e) {
      setReqError(e.message);
    }
  }, []);
  useEffect(() => {
    if (user) loadMine();
  }, [user?.id, loadMine]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user)
    return (
      <p className="py-20 text-center text-sm text-ink-soft">লোড হচ্ছে…</p>
    );

  const on = user.available;
  const toggleAvailable = (v) =>
    updateProfile({ available: v }).catch(() => {}); // PATCH /api/donors/me
  const markFulfilled = async (id) => {
    await api(`/api/requests/${id}`, {
      method: "PATCH",
      body: { status: "Fulfilled" },
    }).catch(() => {});
    loadMine();
  };
  const removeRequest = async (id) => {
    if (!confirm("এই অনুরোধটি মুছে ফেলবেন?")) return;
    await api(`/api/requests/${id}`, { method: "DELETE" }).catch(() => {});
    loadMine();
  };
  const doLogout = async () => {
    await logout();
    router.replace("/login");
  };
  const favDonors = favDonorList;

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-5">
      <ProfileView donorId={user.id} own />

      {/* Social Links */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.href}
            target={social.href.startsWith("tel:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-label={social.name}
            className="group flex min-w-0 flex-col items-center gap-2"
          >
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-full transition duration-200 group-hover:-translate-y-0.5 sm:h-20 sm:w-20 ${social.circle}`}
            >
              {social.icon}
            </span>
            <span className="truncate text-xs font-semibold text-gray-800 sm:text-base">
              {social.name}
            </span>
          </a>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        {/* <div className="min-w-0 space-y-5">
          <Card className="flex items-center gap-3 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
              <UserRound className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">আমি একজন রক্তদাতা</p>
              <Status tone={on ? "success" : "neutral"} className="mt-0.5">
                {on ? "Available" : "Unavailable"}
              </Status>
            </div>
            <Switch on={on} onChange={toggleAvailable} />
          </Card>
        </div> */}

        <div className="min-w-0 space-y-5">
          <Card className="p-4 sm:p-6">
            <p className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Heart className="h-5 w-5 fill-brand-600 text-brand-600" />
              Favorite Donors{" "}
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm text-brand-700">
                {favDonors.length}
              </span>
            </p>
            {favDonors.length ? (
              <ul className="space-y-3">
                {favDonors.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-2.5 rounded-2xl bg-surface p-3 sm:gap-3"
                  >
                    <Avatar name={d.name} src={d.photo} online={d.available} />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/donors/${d.id}`}
                        className="block truncate font-semibold hover:underline"
                      >
                        {d.name}
                      </Link>
                      <p className="truncate text-xs text-ink-soft">
                        {d.district}, {d.upazila}
                      </p>
                    </div>
                    <BloodBadge
                      group={d.bloodGroup}
                      size="sm"
                      className="shrink-0"
                    />
                    <a
                      href={`tel:${d.phone || ""}`}
                      aria-label="Call"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                    <FavButton id={d.id} donor={d} className="shrink-0" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-ink-soft">
                No favorites yet. Tap the heart on a donor card.
              </p>
            )}
          </Card>

          <Card className="p-4 sm:p-5">
            <p className="mb-4 text-lg font-bold">My Requests</p>
            {reqError ? (
              <p className="py-4 text-center text-sm text-brand-600">
                {reqError}
              </p>
            ) : myRequests.length === 0 ? (
              <p className="py-4 text-center text-sm text-ink-soft">
                আপনি এখনও কোনো অনুরোধ করেননি।
              </p>
            ) : (
              <ul className="space-y-3.5">
                {myRequests.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <BloodBadge
                        group={r.bloodGroup}
                        size="sm"
                        className="shrink-0"
                      />
                      <span className="truncate font-medium">
                        {r.patientName}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <Status tone={statusTone[r.status]}>{r.status}</Status>
                      {r.status === "Approved" && (
                        <button
                          type="button"
                          onClick={() => markFulfilled(r.id)}
                          aria-label="Mark fulfilled"
                          title="Fulfilled চিহ্নিত করুন"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 hover:bg-green-200"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeRequest(r.id)}
                        aria-label="Delete request"
                        title="মুছে ফেলুন"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-brand-50 hover:text-brand-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Profile | ID Card | Menu আইকন */}
      <ProfileActions
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
      />

      {/* Menu list + Developer Information + Our Community (ক্লিক করলে দেখাবে) */}
      {menuOpen && <ProfileMenuPanel />}
      {/* Logout → POST /api/auth/logout */}
      <Button size="lg" className="w-full" onClick={doLogout}>
        <LogOut className="h-5 w-5" />
        Logout
      </Button>
    </div>
  );
}
