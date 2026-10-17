// Top Donor badge-এর রং ও লেখা (spec অনুযায়ী)। Gold #FFD700→#FFA500, Silver #C0C0C0→#A8A8A8, Bronze #CD7F32→#8C5430, Top 10 = লাল #E30613
export const BADGES = {
  gold: { place: 1, title: "1st Top Donor - Gold Champion", short: "Gold Champion", bn: "১ম • স্বর্ণ", from: "#FFD700", to: "#FFA500", ink: "#5c3a00" },
  silver: { place: 2, title: "2nd Top Donor - Silver Champion", short: "Silver Champion", bn: "২য় • রৌপ্য", from: "#C0C0C0", to: "#A8A8A8", ink: "#33363b" },
  bronze: { place: 3, title: "3rd Top Donor - Bronze Champion", short: "Bronze Champion", bn: "৩য় • ব্রোঞ্জ", from: "#CD7F32", to: "#8C5430", ink: "#ffffff" },
  top10: { place: 0, title: "Top 10 Hero", short: "Top 10 Hero", bn: "শীর্ষ ১০ হিরো", from: "#E30613", to: "#E30613", ink: "#ffffff" },
};
export const GOLD_BORDER = "#FFD700"; // Top Donor প্রোফাইলের সোনালী border
export const hasBadge = (b) => !!BADGES[b];
export const isChampion = (b) => b === "gold" || b === "silver" || b === "bronze";
export const gradientOf = (b) => (BADGES[b] ? `linear-gradient(135deg, ${BADGES[b].from}, ${BADGES[b].to})` : undefined);
