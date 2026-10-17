// PWA manifest — iPhone/iPad-এ Push পেতে অ্যাপটি "Add to Home Screen" করতে হয়, তার জন্য এটি লাগে।
export default function manifest() {
  return {
    name: "Blood Donate BD",
    short_name: "Blood Donate BD",
    description: "রক্তদাতা খুঁজুন, রক্তের অনুরোধ করুন, জীবন বাঁচান।",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f4f6",
    theme_color: "#dc2626",
    lang: "bn",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
