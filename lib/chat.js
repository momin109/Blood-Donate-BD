import { ApiError } from "@/lib/api";
import { imageUrl } from "@/lib/serializers";
import ChatReport from "@/models/ChatReport";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

export const participantKey = (a, b) => [String(a), String(b)].sort().join("_");
export const otherParticipant = (conv, meId) => conv.participants.find((p) => String(p) !== String(meId));

// শুধু participant হলেই conversation পাওয়া যায়; নইলে 404 (অন্যের conversation আছে কিনা সেটাও বোঝা যায় না)
export async function getMyConversation(id, me) {
  const conv = await Conversation.findOne({ _id: id, participants: me._id });
  if (!conv) throw new ApiError(404, "Conversation not found");
  return conv;
}

// অন্য user-এর যেটুকু chat-এ দেখানো নিরাপদ (phone/area নয়)
export const toChatUser = (u) =>
  u
    ? { id: String(u._id), name: u.name, photo: imageUrl(u.photo), bloodGroup: u.bloodGroup ?? null, district: u.district ?? null }
    : { id: null, name: "Deleted user", photo: null, bloodGroup: null, district: null };

export const CHAT_USER_FIELDS = "name photo bloodGroup district";

// lean() করা conversation → API response
export function toConversation(c, me, usersById, unread = 0) {
  const other = otherParticipant(c, me._id);
  const last = c.lastMessage?.at ? c.lastMessage : null;
  return {
    id: String(c._id),
    other: toChatUser(usersById.get(String(other))),
    lastMessage: last ? { text: last.text, mine: String(last.sender) === String(me._id), at: last.at } : null,
    unread,
    locked: !!c.locked,
    updatedAt: c.lastMessageAt || c.updatedAt,
  };
}

// lean() conversation-এ আমার না-পড়া মেসেজ কয়টি
export function unreadCount(conv, meId) {
  const seen = conv.lastRead?.[String(meId)];
  return Message.countDocuments({ conversation: conv._id, sender: { $ne: meId }, ...(seen ? { createdAt: { $gt: seen } } : {}) });
}

export const toMessage = (m, me) => ({
  id: String(m._id),
  text: m.text,
  mine: String(m.sender) === String(me._id),
  createdAt: m.createdAt,
});

// conversation মুছলে তার মেসেজ ও report-ও মুছে যায় (Admin delete / donor purge)
export async function deleteConversations(filter) {
  const ids = (await Conversation.find(filter).select("_id").lean()).map((c) => c._id);
  if (!ids.length) return 0;
  await Promise.all([Message.deleteMany({ conversation: { $in: ids } }), ChatReport.deleteMany({ conversation: { $in: ids } })]);
  await Conversation.deleteMany({ _id: { $in: ids } });
  return ids.length;
}
