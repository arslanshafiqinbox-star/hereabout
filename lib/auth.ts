import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { emptyPayment, isAdminEmail, isSuperAdminEmail, type PublicUser } from "@/lib/auth-types";
import type { UserDoc } from "@/lib/mongodb";

export type { PublicUser } from "@/lib/auth-types";

export const AUTH_COOKIE = "majlis_token";
export const AUTH_MAX_AGE = 60 * 60 * 24 * 7;

export type AuthPayload = PublicUser & { exp: number };

export function toPublicUser(user: UserDoc): PublicUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    businessName: user.businessName,
    businessEmail: user.businessEmail,
    paymentStatus: user.paymentStatus ?? false,
    isAdmin: Boolean(user.isAdmin) || isAdminEmail(user.email) || isSuperAdminEmail(user.email),
    isSuperAdmin: Boolean(user.isSuperAdmin) || isSuperAdminEmail(user.email),
    payment: {
      ...emptyPayment(user.paymentStatus ?? false),
      stripeCustomerId: user.stripeCustomerId ?? null,
      stripeSubscriptionId: user.stripeSubscriptionId ?? null,
    },
    createdAt: user.created_at.toISOString(),
  };
}

function authSecret() {
  const secret = process.env.AUTH_SECRET || process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing AUTH_SECRET");
  }
  return secret;
}

export function signAuthToken(user: PublicUser) {
  const payload: AuthPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + AUTH_MAX_AGE,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", authSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

export function verifyAuthToken(token: string): AuthPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = createHmac("sha256", authSecret())
    .update(body)
    .digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as AuthPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return {
      ...payload,
      paymentStatus: payload.paymentStatus ?? false,
      isAdmin:
        Boolean(payload.isAdmin) ||
        isAdminEmail(payload.email) ||
        isSuperAdminEmail(payload.email),
      isSuperAdmin:
        Boolean(payload.isSuperAdmin) || isSuperAdminEmail(payload.email),
      payment: payload.payment ?? emptyPayment(payload.paymentStatus ?? false),
    };
  } catch {
    return null;
  }
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_MAX_AGE,
  };
}

export async function getAuthFromCookies() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

export async function getAdminFromCookies() {
  const auth = await getAuthFromCookies();
  if (!auth?.isAdmin) return null;
  return auth;
}

export async function getSuperAdminFromCookies() {
  const auth = await getAuthFromCookies();
  if (!auth?.isSuperAdmin) return null;
  return auth;
}
