import User from "@/models/User";

export const MAX_OPEN_REQUESTS = 5; // spam ঠেকাতে একজন user-এর একসাথে সর্বোচ্চ open request

// BloodRequest document → API response। contactPhone শুধু logged-in user দেখে (privacy)।
export async function serializeRequests(docs, viewer = null) {
  const ids = [...new Set(docs.map((d) => String(d.requester)))];
  const users = await User.find({ _id: { $in: ids } }).select("name donorId").lean();
  const byId = new Map(users.map((u) => [String(u._id), u]));

  return docs.map((d) => {
    const owner = byId.get(String(d.requester));
    return {
      id: String(d._id),
      patientName: d.patientName,
      age: d.age,
      bloodGroup: d.bloodGroup,
      bags: d.bags,
      hemoglobin: d.hemoglobin ?? null,
      hospital: d.hospital,
      division: d.division,
      district: d.district,
      upazila: d.upazila,
      urgency: d.urgency,
      neededAt: d.neededAt,
      reason: d.reason,
      details: d.details ?? "",
      status: d.status,
      createdAt: d.createdAt,
      requester: owner ? { id: String(owner._id), name: owner.name, donorId: owner.donorId } : null,
      ...(viewer ? { contactPhone: d.contactPhone, isOwner: String(d.requester) === String(viewer._id) } : {}),
    };
  });
}
