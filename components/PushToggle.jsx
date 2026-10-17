"use client";
import { useCallback, useEffect, useState } from "react";
import { BellRing, CheckCircle2, Loader2 } from "lucide-react";
import { Button, Card, Status } from "@/components/ui";
import { api } from "@/lib/client";
import { currentSubscription, disablePush, enablePush, isIOS, pushSupported } from "@/lib/push-client";

// status: loading | unsupported | ios-install | unavailable | denied | off | on
function usePush() {
  const [status, setStatus] = useState("loading");
  const [config, setConfig] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let off = false;
    (async () => {
      if (!pushSupported()) return !off && setStatus(isIOS() ? "ios-install" : "unsupported");
      try {
        const cfg = await api("/api/push/subscribe");
        if (off) return;
        setConfig(cfg);
        if (!cfg.enabled) return setStatus("unavailable");
        if (Notification.permission === "denied") return setStatus("denied");
        const sub = await currentSubscription();
        if (!off) setStatus(sub && Notification.permission === "granted" ? "on" : "off");
      } catch {
        if (!off) setStatus("unavailable");
      }
    })();
    return () => {
      off = true;
    };
  }, []);

  const enable = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      await enablePush(config);
      setStatus("on");
    } catch (e) {
      if (typeof Notification !== "undefined" && Notification.permission === "denied") setStatus("denied");
      else setError(e.message || "চালু করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  }, [config]);

  const disable = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      await disablePush();
      setStatus("off");
    } catch (e) {
      setError(e.message || "বন্ধ করা যায়নি।");
    } finally {
      setBusy(false);
    }
  }, []);

  return { status, busy, error, enable, disable };
}

const MESSAGES = {
  unsupported: "এই ব্রাউজারে Push Notification সমর্থিত নয়। Chrome, Edge, Firefox বা Safari-এর নতুন সংস্করণ ব্যবহার করুন।",
  "ios-install": "iPhone/iPad-এ Push পেতে Safari-তে Share বাটন চেপে “Add to Home Screen” করুন, তারপর Home Screen-এর আইকন থেকে অ্যাপ খুলে এখানে ফিরে আসুন।",
  unavailable: "Push Notification এখনো চালু করা হয়নি। পরে আবার চেষ্টা করুন।",
  denied: "ব্রাউজারে এই সাইটের নোটিফিকেশন ব্লক করা আছে। ব্রাউজারের সাইট সেটিংস থেকে অনুমতি দিন, তারপর পেজ রিলোড করুন।",
};

// variant="card": /notifications পেজে পূর্ণ card । variant="inline": bell dropdown-এ ছোট প্রস্তাব (শুধু বন্ধ থাকলে দেখায়)
export default function PushToggle({ variant = "card" }) {
  const { status, busy, error, enable, disable } = usePush();

  if (variant === "inline") {
    if (status !== "off") return null;
    return (
      <div className="flex items-center gap-3 border-b border-gray-100 bg-brand-50/60 p-3">
        <BellRing className="h-5 w-5 shrink-0 text-brand-700" />
        <p className="min-w-0 flex-1 text-xs leading-5 text-brand-800">ব্রাউজার বন্ধ থাকলেও জরুরি আপডেট পেতে Push চালু করুন।</p>
        <Button size="sm" onClick={enable} disabled={busy} className="shrink-0">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "চালু করুন"}
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <BellRing className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold leading-snug">Push Notification</h2>
            {status === "on" && (
              <Status tone="success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                চালু আছে
              </Status>
            )}
          </div>
          {status === "loading" && <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-100" />}
          {status === "off" && <p className="mt-1 text-sm text-ink-soft">ওয়েবসাইট বন্ধ থাকলেও জরুরি রক্তের অনুরোধ ও আপডেট ফোন/কম্পিউটারে পান।</p>}
          {status === "on" && <p className="mt-1 text-sm text-ink-soft">এই ডিভাইসে নতুন নোটিফিকেশন আসলে জানানো হবে।</p>}
          {MESSAGES[status] && <p className="mt-1 break-words text-sm leading-6 text-ink-soft">{MESSAGES[status]}</p>}
          {error && (
            <p role="alert" className="mt-2 rounded-xl bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
              {error}
            </p>
          )}
          {status === "off" && (
            <Button onClick={enable} disabled={busy} className="mt-3 w-full sm:w-auto">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
              Enable Push Notification
            </Button>
          )}
          {status === "on" && (
            <Button variant="outline" size="sm" onClick={disable} disabled={busy} className="mt-3">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              বন্ধ করুন
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
