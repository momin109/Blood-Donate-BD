// Static data: ফর্মের অপশন + Chat/Notifications-এর নমুনা (এগুলো পরের ধাপে API হবে)।
export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const divisions = [
  "ঢাকা",
  "রাজশাহী",
  "চট্টগ্রাম",
  "সিলেট",
  "খুলনা",
  "বরিশাল",
  "রংপুর",
  "ময়মনসিংহ",
];
export const districts = [
  "ঢাকা",
  "রাজশাহী",
  "চট্টগ্রাম",
  "সিলেট",
  "খুলনা",
  "বরিশাল",
  "রংপুর",
  "ময়মনসিংহ",
];
export const upazilas = [
  "সদর",
  "বাঘা",
  "সাভার",
  "মিরপুর",
  "কোতোয়ালী",
  "সিলেট সদর",
];

export const chats = [
  {
    id: 1,
    name: "রাফিয়া সুলতানা",
    last: "ঠিক আছে, আমি আসছি।",
    time: "১০:২৪",
    unread: 2,
    online: true,
    messages: [
      { from: "them", text: "আসসালামু আলাইকুম, রক্ত লাগবে কি?", time: "১০:১৮" },
      { from: "me", text: "জি, B+ লাগবে ঢাকা মেডিকেলে।", time: "১০:২০" },
      { from: "them", text: "ঠিক আছে, আমি আসছি।", time: "১০:২৪" },
    ],
  },
  {
    id: 2,
    name: "তানভীর আহমেদ",
    last: "ধন্যবাদ ভাই।",
    time: "গতকাল",
    unread: 0,
    online: false,
    messages: [
      { from: "me", text: "রক্তদানের জন্য ধন্যবাদ।", time: "৯:০০" },
      { from: "them", text: "ধন্যবাদ ভাই।", time: "৯:০৫" },
    ],
  },
  {
    id: 3,
    name: "সাবরিনা ইসলাম",
    last: "কোন হাসপাতালে?",
    time: "গতকাল",
    unread: 1,
    online: true,
    messages: [{ from: "them", text: "কোন হাসপাতালে?", time: "৮:৩০" }],
  },
  {
    id: 4,
    name: "আরিফ রহমান",
    last: "রোগী কেমন আছে?",
    time: "সোমবার",
    unread: 0,
    online: false,
    messages: [{ from: "them", text: "রোগী কেমন আছে?", time: "৭:১০" }],
  },
];

export const notifications = [
  {
    id: 1,
    type: "like",
    text: "সাবরিনা ইসলাম আপনার পোস্টে লাইক দিয়েছেন।",
    time: "৫ মিনিট আগে",
    unread: true,
  },
  {
    id: 2,
    type: "comment",
    text: "আরিফ রহমান আপনার পোস্টে কমেন্ট করেছেন।",
    time: "২০ মিনিট আগে",
    unread: true,
  },
  {
    id: 3,
    type: "message",
    text: "রাফিয়া সুলতানা আপনাকে নতুন মেসেজ পাঠিয়েছেন।",
    time: "১ ঘণ্টা আগে",
    unread: true,
  },
  {
    id: 4,
    type: "approved",
    text: "আপনার রক্তের অনুরোধ অনুমোদিত হয়েছে।",
    time: "গতকাল",
    unread: false,
  },
  {
    id: 5,
    type: "post",
    text: "ঢাকায় নতুন রক্তদান পোস্ট প্রকাশিত হয়েছে।",
    time: "গতকাল",
    unread: false,
  },
];

// ⚠️ নিচের লিংক ও তথ্য আপনার আসল তথ্য দিয়ে বদলে নিন।
export const contact = {
  whatsapp: "https://wa.me/8801700000000",
  messenger: "https://m.me/blooddonatebd",
  facebook: "https://facebook.com/blooddonatebd",
  page: "https://facebook.com/blooddonatebd",
  group: "https://facebook.com/groups/blooddonatebd",
  telegram: "https://t.me/webfastdns",
  x: "https://x.com/webfastdns",
  linkedin: "https://linkedin.com/company/webfastdns",
  youtube: "https://youtube.com/@webfastdns",
  tiktok: "https://tiktok.com/@webfastdns",
  instagram: "https://instagram.com/webfastdns",
};
export const company = { name: "WebFastDNS" };

// Registration (English) location lists
export const divisionsEn = [
  "Dhaka",
  "Rajshahi",
  "Chattogram",
  "Sylhet",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];
export const districtsEn = [
  "Dhaka",
  "Rajshahi",
  "Chattogram",
  "Sylhet",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];
export const upazilasEn = [
  "Sadar",
  "Bagha",
  "Savar",
  "Mirpur",
  "Kotwali",
  "Sylhet Sadar",
];

export const developer = {
  name: "Momin",
  role: "Full Stack Developer",
  stack: ["Next.js", "React", "Node.js", "MongoDB", "PostgreSQL"],
  email: "developer@example.com",
  website: "https://example.com",
};
