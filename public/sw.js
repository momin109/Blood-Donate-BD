/* Blood Donate BD — Service Worker (শুধু Push Notification-এর জন্য; কোনো cache/offline কাজ করে না)।
 * Website বন্ধ থাকলেও browser এই ফাইলটি চালিয়ে Push দেখায়। */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Push এলে notification দেখানো
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Blood Donate BD";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    lang: "bn",
    data: { url: data.url || "/notifications" },
  };
  if (data.tag) options.tag = data.tag;
  if (data.image) {
    try {
      options.image = new URL(data.image, self.location.origin).href; // সব browser ছবি দেখায় না — যেগুলো দেখায় তারাই নেবে
    } catch (e) {}
  }

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      // খোলা tab থাকলে bell-এর সংখ্যা সঙ্গে সঙ্গে আপডেট করতে
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((list) => list.forEach((c) => c.postMessage({ type: "notification:new" }))),
    ])
  );
});

// Notification-এ ক্লিক করলে নির্দিষ্ট page খোলা
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  let target;
  try {
    target = new URL((event.notification.data && event.notification.data.url) || "/notifications", self.location.origin);
  } catch (e) {
    target = new URL("/notifications", self.location.origin);
  }
  if (!/^https?:$/.test(target.protocol)) target = new URL("/notifications", self.location.origin);

  event.waitUntil(
    (async () => {
      if (target.origin === self.location.origin) {
        const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        for (const client of list) {
          if (new URL(client.url).origin !== self.location.origin) continue;
          try {
            await client.focus();
            if ("navigate" in client) await client.navigate(target.href);
            return;
          } catch (e) {
            /* নিচে নতুন window খোলা হবে */
          }
        }
      }
      await self.clients.openWindow(target.href);
    })()
  );
});

// Browser নিজে subscription বদলালে (key rotate/expire) আবার subscribe করে সার্ভারকে জানানো
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const old = event.oldSubscription;
        const key = old && old.options && old.options.applicationServerKey;
        if (!key) return;
        const sub = await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(sub.toJSON()),
        });
      } catch (e) {}
    })()
  );
});
