export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const ROLES = ["user", "admin"];
export const USER_STATUSES = ["Active", "Pending", "Blocked"];

// Blood request (ফর্মের অপশনের সাথে মিল রাখা হয়েছে)
export const REQUEST_REASONS = ["অপারেশন", "দুর্ঘটনা", "থ্যালাসেমিয়া", "ডেঙ্গু", "রক্তস্বল্পতা", "অন্যান্য"];
export const URGENCIES = ["Normal", "Urgent", "Very Urgent"];
export const REQUEST_STATUSES = ["Pending", "Approved", "Fulfilled", "Rejected"];
export const PUBLIC_REQUEST_STATUSES = ["Approved", "Fulfilled"];

// Post / image
export const POST_KINDS = ["donate", "general", "request"]; // "request" শুধু রক্তের অনুরোধ থেকে স্বয়ংক্রিয়ভাবে তৈরি হয়
export const POST_ACTIONS = ["like", "save", "share", "report"];
export const IMAGE_PURPOSES = ["avatar", "post"];
export const IMAGE_MAX_BYTES = { avatar: 2 * 1024 * 1024, post: 5 * 1024 * 1024 };
export const MAX_POST_IMAGES = 4;

// Admin
export const POST_STATUSES = ["Approved", "Pending", "Rejected"]; // feed-এ শুধু Approved দেখায় (status না থাকলেও Approved ধরা হয়)
export const HIDDEN_POST_STATUSES = ["Pending", "Rejected"];
export const REPORT_STATUSES = ["Open", "Resolved", "Dismissed"];
// Ad-এর রঙ DB-তে key হিসেবে থাকে; Tailwind যেন class গুলো চেনে তাই পুরো class এখানে লেখা (tailwind content-এ ./lib যোগ করা আছে)
export const AD_TONES = {
  indigo: "from-indigo-600 to-blue-500",
  emerald: "from-emerald-600 to-teal-500",
  orange: "from-orange-500 to-rose-500",
  brand: "from-brand-600 to-brand-400",
  purple: "from-purple-600 to-pink-500",
};

// Top Donor ranking
export const DONATION_STATUSES = ["Pending", "Approved", "Rejected"];
export const BADGE_TYPES = ["gold", "silver", "bronze", "top10", "none"];
