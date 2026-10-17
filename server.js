/* Custom server: Next.js + Socket.IO একই port ও একই process-এ চলে।
 *   Development : npm run dev      (node server.js --dev)
 *   Production  : npm run build && npm start   (node server.js)
 *
 * Message পাঠানো/সংরক্ষণ আগের মতোই REST API (POST /api/chat/conversations/:id/messages) দিয়ে হয়।
 * সেই route MongoDB-তে save করে `globalThis.__io` দিয়ে (lib/realtime.js) room-এ event পাঠায়।
 * এই ফাইলের কাজ: connection-এ authentication, room join-এ permission যাচাই।
 *
 * Event নাম lib/realtime.js ও app/(main)/chat/page.js-এর সাথে মিল রাখতে হবে।
 */
const dev = process.argv.includes("--dev");
process.env.NODE_ENV = process.env.NODE_ENV || (dev ? "development" : "production");

const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");
const { jwtVerify } = require("jose");
const mongoose = require("mongoose");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd(), dev); // .env.local পড়া (Next-এর মতোই)

const port = Number(process.env.PORT) || 3000;
const COOKIE_NAME = "bdbd_token"; // lib/auth.js-এর COOKIE_NAME-এর সাথে একই
const isId = (v) => typeof v === "string" && /^[0-9a-fA-F]{24}$/.test(v);

// ---- Auth ও permission (existing JWT cookie + MongoDB ব্যবহার করে) ----
// Next-এর bundle থেকে আলাদা, তাই এখানে নিজস্ব হালকা connection; শুধু users/conversations পড়া হয়।
let dbPromise = null;
function getDb() {
  if (!dbPromise) {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
    const conn = mongoose.createConnection(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    dbPromise = conn.asPromise().then(() => conn.db).catch((err) => {
      dbPromise = null; // পরের চেষ্টায় আবার
      throw err;
    });
  }
  return dbPromise;
}

function readCookie(header = "", name) {
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) {
      try {
        return decodeURIComponent(part.slice(i + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

// Token ঠিক + user আছে + Blocked নয় → user id; নইলে null (lib/auth.js getAuthUser-এর মতো নিয়ম)
async function activeUserId(userId) {
  if (!isId(userId)) return null;
  const db = await getDb();
  const user = await db.collection("users").findOne({ _id: new mongoose.Types.ObjectId(userId) }, { projection: { status: 1 } });
  return user && user.status !== "Blocked" ? String(user._id) : null;
}

async function authenticate(socket) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) throw new Error("JWT_SECRET is missing or too short");
  const token = readCookie(socket.request.headers.cookie, COOKIE_NAME);
  if (!token) return null;
  let payload;
  try {
    ({ payload } = await jwtVerify(token, new TextEncoder().encode(secret)));
  } catch {
    return null;
  }
  return activeUserId(payload.sub);
}

// আমি এই conversation-এর participant কিনা (এবং আমি এখনও Active কিনা)
async function canJoin(userId, conversationId) {
  if (!isId(conversationId) || !(await activeUserId(userId))) return false;
  const db = await getDb();
  const oid = mongoose.Types.ObjectId;
  const conv = await db.collection("conversations").findOne({ _id: new oid(conversationId), participants: new oid(userId) }, { projection: { _id: 1 } });
  return !!conv;
}

// ---- Server ----
let handle;
const httpServer = createServer((req, res) => handle(req, res));
const app = next({ dev, hostname: "localhost", port, httpServer });
handle = app.getRequestHandler();

const io = new Server(httpServer, {
  path: "/socket.io",
  serveClient: false,
  // অন্য সাইট থেকে connection ঠেকানো: Origin থাকলে তা এই সাইটের host-এর সমান হতে হবে
  allowRequest: (req, cb) => {
    const origin = req.headers.origin;
    if (!origin) return cb(null, true);
    try {
      cb(null, new URL(origin).host === (req.headers["x-forwarded-host"] || req.headers.host));
    } catch {
      cb(null, false);
    }
  },
});
globalThis.__io = io; // API route-গুলো (lib/realtime.js) এটি দিয়ে event পাঠায়

// Connection-এ login যাচাই; ব্যর্থ হলে connect_error("unauthorized")
io.use(async (socket, nextFn) => {
  try {
    const userId = await authenticate(socket);
    if (!userId) return nextFn(new Error("unauthorized"));
    socket.data.userId = userId;
    nextFn();
  } catch (err) {
    console.error("[socket] auth error:", err.message);
    nextFn(new Error("server_error"));
  }
});

const convRooms = (socket) => [...socket.rooms].filter((r) => r.startsWith("conv:"));

io.on("connection", (socket) => {
  const userId = socket.data.userId;
  socket.join(`user:${userId}`); // নিজের ঘর: conversation list আপডেটের জন্য (শুধু নিজের verified id)

  // এক সময়ে একটি conversation খোলা থাকে। participant হলেই room-এ ঢোকা যায়
  socket.on("conversation:join", async (conversationId, ack) => {
    const reply = typeof ack === "function" ? ack : () => {};
    try {
      if (!(await canJoin(userId, conversationId))) return reply({ ok: false, error: "forbidden" });
      convRooms(socket).forEach((r) => socket.leave(r));
      socket.join(`conv:${conversationId}`);
      reply({ ok: true });
    } catch (err) {
      console.error("[socket] join error:", err.message);
      reply({ ok: false, error: "server_error" });
    }
  });

  socket.on("conversation:leave", () => convRooms(socket).forEach((r) => socket.leave(r)));
});

// প্রতি রাত ১২টায় (বাংলাদেশ সময়, UTC+6) Top Donor র‍্যাংকিং আপডেট: নিজের /api/cron/ranking ডাকে।
// CRON_SECRET না থাকলে বন্ধ; তখন Admin → Top Donors → "Recalculate" বা বাইরের cron ব্যবহার করুন।
const msUntilDhakaMidnight = (now = Date.now()) => {
  const OFFSET = 6 * 3600e3;
  const DAY = 86400e3;
  return (Math.floor((now + OFFSET) / DAY) + 1) * DAY - OFFSET - now;
};
function scheduleNightlyRanking() {
  const secret = process.env.CRON_SECRET;
  if (!secret) return console.log("> Nightly ranking update is off (set CRON_SECRET to enable)");
  const loop = () =>
    setTimeout(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/api/cron/ranking`, { method: "POST", headers: { authorization: `Bearer ${secret}` } });
        console.log(`[cron] ranking update → HTTP ${res.status}`);
      } catch (err) {
        console.error("[cron] ranking update failed:", err.message);
      }
      loop();
    }, msUntilDhakaMidnight() + 1000);
  loop();
}

app.prepare().then(() => {
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port} (${dev ? "development" : "production"}, Socket.IO enabled)`);
    scheduleNightlyRanking();
  });
});

const shutdown = () => {
  io.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
