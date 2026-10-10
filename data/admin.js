// Static sample data for the Admin Panel UI (replace with API data later)
const names = ["Rahim Uddin", "Karim Hossain", "Nusrat Jahan", "Sabbir Ahmed", "Mim Akter", "Tanvir Hasan", "Farhana Islam", "Imran Khan", "Sadia Rahman", "Jahid Hasan", "Shila Begum", "Mehedi Hasan", "Rafiq Ullah", "Laboni Akter"];
const groups = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];
const locs = ["Dhaka, Mirpur", "Rajshahi, Bagha", "Chattogram, Kotwali", "Sylhet Sadar", "Khulna Sadar", "Barishal Sadar", "Rangpur Sadar", "Dhaka, Savar"];
const months = ["Jan", "Mar", "Jun", "Aug"];

export const adminDonors = names.map((name, i) => ({
  id: i + 1, donorId: `BD-${String(100 + i * 7).padStart(5, "0")}`, name, phone: `017${String(10000000 + i * 1234567).slice(0, 8)}`,
  group: groups[i % 8], location: locs[i % 8], last: `${(i % 27) + 1} ${months[i % 4]} 2026`, donations: (i * 3) % 9 + 1,
  status: ["Active", "Active", "Pending", "Blocked"][i % 4],
}));

const patients = ["Abdul Karim", "Fatema Begum", "Rahim Uddin", "Shiuli Akter", "Nasir Ahmed", "Rokeya Khatun", "Jamal Hossain", "Salma Begum", "Habib Rahman", "Mina Akter"];
const hospitals = ["Dhaka Medical College", "Khulna Sadar Hospital", "Rajshahi Medical College", "Osmani Hospital, Sylhet", "Square Hospital", "Chattogram Medical College"];
export const adminRequests = patients.map((patient, i) => ({
  id: i + 1, patient, group: groups[(i * 3) % 8], bags: (i % 3) + 1, hospital: hospitals[i % 6], location: locs[(i + 2) % 8],
  needed: `${12 + i} Oct 2026`, urgency: ["Urgent", "Normal", "Very Urgent"][i % 3], status: ["Pending", "Approved", "Fulfilled", "Rejected", "Approved"][i % 5],
}));

const excerpts = ["জরুরি B+ রক্ত প্রয়োজন ঢাকা মেডিকেলে।", "আজ ৭ম বারের মতো রক্ত দিলাম।", "O- ডোনার খুঁজছি, অপারেশনের জন্য।", "Special offer! Click this link to win a prize", "রাজশাহীতে A+ রক্ত লাগবে জরুরি ভিত্তিতে।", "রক্তদান সচেতনতা সভা আগামী শুক্রবার।", "Buy cheap products now!!! Limited deal", "থ্যালাসেমিয়া রোগীর জন্য রক্ত দরকার।", "ধন্যবাদ সবাইকে সাহায্যের জন্য।"];
export const adminPosts = excerpts.map((text, i) => ({
  id: i + 1, author: names[i], text, type: i % 3 === 1 ? "Donation" : "Request", reports: [0, 0, 1, 6, 0, 0, 4, 0, 0][i], time: `${i + 1}h ago`,
  status: ["Auto-Approved", "Auto-Approved", "Pending", "Rejected", "Auto-Approved", "Pending", "Rejected", "Auto-Approved", "Pending"][i],
}));

export const adminReports = [
  { id: 1, post: "Special offer! Click this link to win a prize", reason: "Spam", by: "Nusrat Jahan", date: "10 Oct 2026", status: "Open" },
  { id: 2, post: "Buy cheap products now!!! Limited deal", reason: "Spam / Advertising", by: "Rahim Uddin", date: "10 Oct 2026", status: "Open" },
  { id: 3, post: "জরুরি B+ রক্ত প্রয়োজন ঢাকা মেডিকেলে।", reason: "Wrong information", by: "Sabbir Ahmed", date: "9 Oct 2026", status: "Dismissed" },
  { id: 4, post: "O- ডোনার খুঁজছি, অপারেশনের জন্য।", reason: "Inappropriate", by: "Mim Akter", date: "8 Oct 2026", status: "Resolved" },
  { id: 5, post: "Buy cheap products now!!! Limited deal", reason: "Scam", by: "Imran Khan", date: "8 Oct 2026", status: "Open" },
];

export const adminAds = [
  { id: 1, title: "Your Brand Here", text: "Reach thousands of donors and volunteers across Bangladesh.", cta: "Advertise With Us", link: "https://example.com", every: 6, impressions: 48210, clicks: 1320, active: true, tone: "from-indigo-600 to-blue-500", start: "2026-10-01", end: "2026-12-31" },
  { id: 2, title: "Health Checkup Package", text: "Special discount on full-body health screening this month.", cta: "Learn More", link: "https://example.com/health", every: 7, impressions: 31090, clicks: 840, active: true, tone: "from-emerald-600 to-teal-500", start: "2026-10-05", end: "2026-11-30" },
  { id: 3, title: "Pharmacy Delivery", text: "Medicine delivered to your door within 2 hours.", cta: "Order Now", link: "https://example.com/pharmacy", every: 5, impressions: 12400, clicks: 210, active: false, tone: "from-orange-500 to-rose-500", start: "2026-09-01", end: "2026-09-30" },
];

export const monthly = [["Apr", 640], ["May", 720], ["Jun", 810], ["Jul", 760], ["Aug", 940], ["Sep", 1010], ["Oct", 1086]];
export const bloodDist = [["O+", 3120], ["A+", 2640], ["B+", 2410], ["AB+", 980], ["O-", 760], ["A-", 640], ["B-", 580], ["AB-", 350]];
export const activity = [
  ["New donor registered", "Nusrat Jahan joined as a donor", "2 min ago"],
  ["Request approved", "Blood request #1042 was approved", "18 min ago"],
  ["Post reported", "Spam report on a feed post", "1 hour ago"],
  ["Request fulfilled", "Shiuli Akter received 2 bags of AB+", "3 hours ago"],
  ["Ad impression milestone", "“Your Brand Here” reached 48k views", "Yesterday"],
];

export const statusTone = { Active: "success", Pending: "warning", Blocked: "danger", Approved: "success", Rejected: "danger", Fulfilled: "neutral", "Auto-Approved": "success", Open: "warning", Resolved: "success", Dismissed: "neutral", Urgent: "warning", "Very Urgent": "danger", Normal: "neutral" };
