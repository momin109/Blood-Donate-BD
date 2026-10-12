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
    lastDonationDate: u.lastDonationDate,
    donationCount: u.donationCount,
    available: u.available,
    joinedAt: u.createdAt,
    ...(authed ? { phone: u.phone, area: u.area } : {}),
    ...(isFavorite !== undefined ? { isFavorite } : {}),
  };
}
