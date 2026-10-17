export const imageUrl = (id) => (id ? `/api/images/${id}` : null);

// অন্য user-কে দেখানোর জন্য donor-এর public রূপ।
// phone ও area শুধু logged-in user দেখতে পায় (privacy)।
export function toPublicDonor(u, { authed = false, isFavorite } = {}) {
  return {
    id: String(u._id),
    donorId: u.donorId,
    name: u.name,
    bloodGroup: u.bloodGroup,
    division: u.division,
    district: u.district,
    upazila: u.upazila,
    photo: imageUrl(u.photo),
    lastDonationDate: u.lastDonationDate,
    donationCount: u.donationCount,
    // Top Donor: badge = gold|silver|bronze|top10|none, rank = ১,২,৩… (০ = র‍্যাংকে নেই)
    badge: u.badgeType || "none",
    rank: u.donorRank || 0,
    score: u.donorScore || 0,
    available: u.available,
    joinedAt: u.createdAt,
    ...(authed ? { phone: u.phone, area: u.area } : {}),
    ...(isFavorite !== undefined ? { isFavorite } : {}),
  };
}
