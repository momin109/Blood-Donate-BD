// Static sample data. পরে API call দিয়ে এই ফাইলের জায়গায় fetch বসানো যাবে।
export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const divisions = ["ঢাকা", "রাজশাহী", "চট্টগ্রাম", "সিলেট", "খুলনা", "বরিশাল", "রংপুর", "ময়মনসিংহ"];
export const districts = ["ঢাকা", "রাজশাহী", "চট্টগ্রাম", "সিলেট", "খুলনা", "বরিশাল", "রংপুর", "ময়মনসিংহ"];
export const upazilas = ["সদর", "বাঘা", "সাভার", "মিরপুর", "কোতোয়ালী", "সিলেট সদর"];

export const donors = [
  { id: 1, name: "মোমিন হোসেন", group: "O+", district: "ঢাকা", upazila: "মিরপুর", last: "১২ জুন ২০২৬", available: true, phone: "01700-000125", donorId: "BD-00125", joined: "জানুয়ারি ২০২৫", count: 7 },
  { id: 2, name: "রাফিয়া সুলতানা", group: "A+", district: "রাজশাহী", upazila: "বাঘা", last: "৩ মার্চ ২০২৬", available: true, phone: "01800-000231", donorId: "BD-00231", joined: "মার্চ ২০২৫", count: 4 },
  { id: 3, name: "তানভীর আহমেদ", group: "B-", district: "চট্টগ্রাম", upazila: "কোতোয়ালী", last: "২০ আগস্ট ২০২৬", available: false, phone: "01900-000342", donorId: "BD-00342", joined: "জুন ২০২৫", count: 9 },
  { id: 4, name: "সাবরিনা ইসলাম", group: "AB+", district: "সিলেট", upazila: "সিলেট সদর", last: "১৪ জানু ২০২৬", available: true, phone: "01600-000418", donorId: "BD-00418", joined: "আগস্ট ২০২৫", count: 3 },
  { id: 5, name: "আরিফ রহমান", group: "O-", district: "খুলনা", upazila: "সদর", last: "৯ এপ্রিল ২০২৬", available: true, phone: "01500-000529", donorId: "BD-00529", joined: "অক্টোবর ২০২৫", count: 6 },
  { id: 6, name: "নুসরাত জাহান", group: "A-", district: "ঢাকা", upazila: "সাভার", last: "২ জুলাই ২০২৬", available: false, phone: "01300-000630", donorId: "BD-00630", joined: "ডিসেম্বর ২০২৫", count: 2 },
];
export const me = donors[0];
export const getDonor = (id) => donors.find((d) => String(d.id) === String(id)) || donors[0];

export const posts = [
  { id: 1, kind: "donate", donorId: 2, time: "২ ঘণ্টা আগে", text: "আমি A+ রক্তদাতা। রাজশাহী ও আশেপাশে যেকোনো জরুরি প্রয়োজনে যোগাযোগ করুন, ইনশাআল্লাহ সাহায্য করব।", likes: 24, comments: 6, shares: 3 },
  { id: 2, kind: "request", donorId: 4, time: "৪০ মিনিট আগে", urgent: true, group: "B+", patient: "আব্দুল করিম", problem: "ডেঙ্গু, প্লেটলেট কম", hb: "৭", hospital: "ঢাকা মেডিকেল কলেজ হাসপাতাল", location: "ঢাকা, সদর", bags: 2, date: "আজ, রাত ৮:০০টা", text: "ডেঙ্গু রোগীর জন্য জরুরি ২ ব্যাগ B+ রক্ত প্রয়োজন।", likes: 58, comments: 14, shares: 31 },
  { id: 3, kind: "donate", donorId: 1, time: "গতকাল", text: "আজ ৭ম বারের মতো রক্ত দিলাম। একটি ব্যাগ রক্ত তিনটি জীবন বাঁচাতে পারে। আপনিও এগিয়ে আসুন।", likes: 112, comments: 21, shares: 18 },
  { id: 4, kind: "request", donorId: 5, time: "৩ ঘণ্টা আগে", urgent: false, group: "O-", patient: "ফাতেমা বেগম", problem: "অপারেশন (সিজার)", hb: "জানা নেই", hospital: "খুলনা সদর হাসপাতাল", location: "খুলনা, সদর", bags: 1, date: "১৫ অক্টোবর, সকাল ১০:০০টা", text: "অপারেশনের জন্য ১ ব্যাগ O- রক্ত লাগবে।", likes: 17, comments: 4, shares: 9 },
];

export const requests = [
  { id: 1, patient: "আব্দুল করিম", group: "B+", hospital: "ঢাকা মেডিকেল কলেজ হাসপাতাল", location: "ঢাকা, সদর", date: "আজ, রাত ৮:০০টা", status: "Urgent" },
  { id: 2, patient: "ফাতেমা বেগম", group: "O-", hospital: "খুলনা সদর হাসপাতাল", location: "খুলনা, সদর", date: "১৫ অক্টোবর", status: "Pending" },
  { id: 3, patient: "রহিম উদ্দিন", group: "A+", hospital: "রাজশাহী মেডিকেল কলেজ", location: "রাজশাহী, বাঘা", date: "১২ অক্টোবর", status: "Approved" },
  { id: 4, patient: "শিউলি আক্তার", group: "AB+", hospital: "সিলেট ওসমানী হাসপাতাল", location: "সিলেট, সদর", date: "৫ অক্টোবর", status: "Fulfilled" },
];

export const chats = [
  { id: 1, name: "রাফিয়া সুলতানা", last: "ঠিক আছে, আমি আসছি।", time: "১০:২৪", unread: 2, online: true, messages: [
    { from: "them", text: "আসসালামু আলাইকুম, রক্ত লাগবে কি?", time: "১০:১৮" },
    { from: "me", text: "জি, B+ লাগবে ঢাকা মেডিকেলে।", time: "১০:২০" },
    { from: "them", text: "ঠিক আছে, আমি আসছি।", time: "১০:২৪" } ] },
  { id: 2, name: "তানভীর আহমেদ", last: "ধন্যবাদ ভাই।", time: "গতকাল", unread: 0, online: false, messages: [
    { from: "me", text: "রক্তদানের জন্য ধন্যবাদ।", time: "৯:০০" },
    { from: "them", text: "ধন্যবাদ ভাই।", time: "৯:০৫" } ] },
  { id: 3, name: "সাবরিনা ইসলাম", last: "কোন হাসপাতালে?", time: "গতকাল", unread: 1, online: true, messages: [
    { from: "them", text: "কোন হাসপাতালে?", time: "৮:৩০" } ] },
  { id: 4, name: "আরিফ রহমান", last: "রোগী কেমন আছে?", time: "সোমবার", unread: 0, online: false, messages: [
    { from: "them", text: "রোগী কেমন আছে?", time: "৭:১০" } ] },
];

export const notifications = [
  { id: 1, type: "like", text: "সাবরিনা ইসলাম আপনার পোস্টে লাইক দিয়েছেন।", time: "৫ মিনিট আগে", unread: true },
  { id: 2, type: "comment", text: "আরিফ রহমান আপনার পোস্টে কমেন্ট করেছেন।", time: "২০ মিনিট আগে", unread: true },
  { id: 3, type: "message", text: "রাফিয়া সুলতানা আপনাকে নতুন মেসেজ পাঠিয়েছেন।", time: "১ ঘণ্টা আগে", unread: true },
  { id: 4, type: "approved", text: "আপনার রক্তের অনুরোধ অনুমোদিত হয়েছে।", time: "গতকাল", unread: false },
  { id: 5, type: "post", text: "ঢাকায় নতুন রক্তদান পোস্ট প্রকাশিত হয়েছে।", time: "গতকাল", unread: false },
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
export const divisionsEn = ["Dhaka", "Rajshahi", "Chattogram", "Sylhet", "Khulna", "Barishal", "Rangpur", "Mymensingh"];
export const districtsEn = ["Dhaka", "Rajshahi", "Chattogram", "Sylhet", "Khulna", "Barishal", "Rangpur", "Mymensingh"];
export const upazilasEn = ["Sadar", "Bagha", "Savar", "Mirpur", "Kotwali", "Sylhet Sadar"];

// Home feed: sample posts (ad slot is inserted every AD_EVERY posts in components/Feed.jsx)
export const feedPosts = [...posts, ...Array.from({ length: 9 }, (_, i) => ({ ...posts[i % 4], id: 5 + i, time: `${i + 1} দিন আগে` }))];
export const developer = {
  name: "Momin",
  role: "Full Stack Developer",
  stack: ["Next.js", "React", "Node.js", "MongoDB", "PostgreSQL"],
  email: "developer@example.com",
  website: "https://example.com",
};
export const initialFavorites = [2, 4];
