// Socket.IO event পাঠানোর helper। server.js (custom server) চালু থাকলে globalThis.__io থাকে।
// `next dev` / serverless-এ io নেই → কিছু না করে ফিরে যায়; REST API ও polling আগের মতোই কাজ করে।
// Event/room নাম server.js ও app/(main)/chat/page.js-এর সাথে মিল রাখতে হবে।
const safe = (fn) => {
  try {
    const io = globalThis.__io;
    if (io) fn(io);
  } catch (err) {
    console.error("[realtime]", err); // realtime ব্যর্থ হলেও message পাঠানো যেন না আটকায়
  }
};

// নতুন মেসেজ: conversation room-এ (যারা চ্যাট খুলে রেখেছে) + দুইজনের নিজস্ব room-এ list আপডেটের সংকেত।
// msg MongoDB-তে save হওয়ার পরই ডাকতে হবে।
export function emitNewMessage(conv, msg) {
  safe((io) => {
    io.to(`conv:${conv._id}`).emit("message:new", {
      id: String(msg._id),
      conversationId: String(conv._id),
      senderId: String(msg.sender),
      text: msg.text,
      createdAt: msg.createdAt,
    });
    conv.participants.forEach((p) => io.to(`user:${p}`).emit("conversation:updated", { id: String(conv._id) }));
  });
}

// Lock/unlock/delete-এর পর দুই participant-এর list নতুন করে আনার সংকেত
export function emitConversationUpdated(conv) {
  safe((io) => conv.participants.forEach((p) => io.to(`user:${p}`).emit("conversation:updated", { id: String(conv._id) })));
}
