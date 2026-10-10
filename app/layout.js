import "./globals.css";

export const metadata = {
  title: "Blood Donate BD",
  description: "রক্তদাতা খুঁজুন, রক্তের অনুরোধ করুন, জীবন বাঁচান।",
};
export const viewport = { width: "device-width", initialScale: 1, themeColor: "#dc2626" };

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
