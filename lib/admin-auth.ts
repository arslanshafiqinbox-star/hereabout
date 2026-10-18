import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/mongodb";

export const ADMIN_COOKIE = "hereabouts_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

export type AdminToken = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  exp: number;
};

function secret() {
  const value = process.env.AUTH_SECRET || process.env.MONGODB_URI;
  if (!value) throw new Error("Missing MONGODB_URI");
  return value;
}

export function signAdminToken(user: Omit<AdminToken, "exp">) {
  const payload: AdminToken = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyAdminToken(token: string): AdminToken | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AdminToken;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.role !== "admin" && payload.role !== "editor") return null;
    return payload;
  } catch {
    return null;
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };
}

export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
