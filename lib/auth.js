import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const COOKIE_NAME = "bdbd_token";

function secretKey() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error("JWT_SECRET is missing or too short (min 16 chars). Check your .env.local");
  return new TextEncoder().encode(s);
}
const expiresIn = () => process.env.JWT_EXPIRES_IN || "7d";

function maxAgeSeconds() {
  const m = /^(\d+)([smhd])$/.exec(expiresIn());
  if (!m) return 60 * 60 * 24 * 7;
  return Number(m[1]) * { s: 1, m: 60, h: 3600, d: 86400 }[m[2]];
}

export const signToken = (user) =>
  new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user._id))
    .setIssuedAt()
    .setExpirationTime(expiresIn())
    .sign(secretKey());

const cookieBase = () => ({ httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
export const setAuthCookie = (token) => cookies().set(COOKIE_NAME, token, { ...cookieBase(), maxAge: maxAgeSeconds() });
export const clearAuthCookie = () => cookies().set(COOKIE_NAME, "", { ...cookieBase(), maxAge: 0 });

// Cookie অথবা "Authorization: Bearer <token>" থেকে logged-in user বের করে। না পেলে null।
export async function getAuthUser(req) {
  const bearer = req?.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const token = bearer || cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  let payload;
  try {
    ({ payload } = await jwtVerify(token, secretKey()));
  } catch {
    return null;
  }
  await connectDB();
  const user = await User.findById(payload.sub);
  if (!user || user.status === "Blocked") return null;
  return user;
}

// Authentication (401) + optional role-based authorization (403)
export async function requireAuth(req, ...roles) {
  const user = await getAuthUser(req);
  if (!user) throw new ApiError(401, "Authentication required");
  if (roles.length && !roles.includes(user.role)) throw new ApiError(403, "You do not have permission to do this");
  return user;
}

// শুধু admin (নইলে 401/403)
export const requireAdmin = (req) => requireAuth(req, "admin");
