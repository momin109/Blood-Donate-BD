// Browser-side Push helper (শুধু client component থেকে ডাকুন)।
// "চালু" মানে: এই browser-এ push subscription আছে। বন্ধ করলে browser ও সার্ভার — দুই জায়গা থেকেই মোছে।
// Logout-এ শুধু সার্ভার থেকে মোছা হয় (detachPush), আবার login করলে syncPush নিজে থেকে এই user-এর সাথে জুড়ে দেয়।
import { api } from "@/lib/client";

export const pushSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export const isIOS = () =>
  typeof navigator !== "undefined" && (/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

function urlBase64ToUint8Array(b64) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function registration() {
  await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  return navigator.serviceWorker.ready;
}

export async function currentSubscription() {
  if (!pushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.getRegistration("/");
    return reg ? await reg.pushManager.getSubscription() : null;
  } catch {
    return null;
  }
}

// ব্যবহারকারীর click handler থেকে ডাকতে হবে (permission popup-এর জন্য)।
// config = GET /api/push/subscribe-এর ফল { enabled, publicKey }
export async function enablePush(config) {
  if (!pushSupported()) throw new Error("এই ব্রাউজারে Push Notification সমর্থিত নয়।");
  if (!config?.enabled || !config.publicKey) throw new Error("এই মুহূর্তে Push Notification চালু নেই।");
  const permission = await Notification.requestPermission(); // সবার আগে — user gesture থাকতে থাকতে
  if (permission !== "granted") throw new Error(permission === "denied" ? "নোটিফিকেশনের অনুমতি ব্লক করা আছে।" : "অনুমতি দেওয়া হয়নি।");

  const reg = await registration();
  const key = urlBase64ToUint8Array(config.publicKey);
  let sub = await reg.pushManager.getSubscription();
  // সার্ভারের VAPID key বদলে গেলে পুরনো subscription আর কাজ করে না — নতুন করে নিতে হয়
  const old = sub?.options?.applicationServerKey;
  if (old) {
    const a = new Uint8Array(old);
    if (a.length !== key.length || a.some((v, i) => v !== key[i])) {
      await sub.unsubscribe().catch(() => {});
      sub = null;
    }
  }
  if (!sub) {
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  }
  try {
    await api("/api/push/subscribe", { method: "POST", body: sub.toJSON() });
  } catch (err) {
    // সার্ভারে সংরক্ষণ না হলে browser-এও রাখি না, যাতে "চালু" ভুলভাবে না দেখায়
    await sub.unsubscribe().catch(() => {});
    throw err;
  }
}

export async function disablePush() {
  const sub = await currentSubscription();
  if (!sub) return;
  await api("/api/push/subscribe", { method: "DELETE", body: { endpoint: sub.endpoint } }).catch(() => {});
  await sub.unsubscribe().catch(() => {});
}

// Logout-এর আগে: এই device-এ আর এই user-এর Push যাবে না (browser subscription থাকে)
export async function detachPush() {
  try {
    const sub = await currentSubscription();
    if (sub) await api("/api/push/subscribe", { method: "DELETE", body: { endpoint: sub.endpoint } });
  } catch {}
}

// Login থাকা অবস্থায় পেজ খুললে: subscription থাকলে (এবং অনুমতি থাকলে) বর্তমান user-এর সাথে জুড়ে রাখা
export async function syncPush() {
  try {
    if (!pushSupported() || Notification.permission !== "granted") return;
    const sub = await currentSubscription();
    if (sub) await api("/api/push/subscribe", { method: "POST", body: sub.toJSON() });
  } catch {}
}
