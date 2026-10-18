import type { PublicUser } from "@/lib/auth-types";

export const ADMIN_TOKEN_KEY = "adminAccessToken";
export const ADMIN_EMAIL_KEY = "adminEmail";
export const ADMIN_SESSION_KEY = "majlis_admin_session";

export type AdminSession = {
  token: string;
  user: PublicUser;
};

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.token || !parsed?.user?.isAdmin) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setAdminSession(session: AdminSession) {
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  sessionStorage.setItem(ADMIN_TOKEN_KEY, session.token);
  sessionStorage.setItem(ADMIN_EMAIL_KEY, session.user.email);
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return getAdminSession()?.token ?? sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function isAdminSignedIn(): boolean {
  return Boolean(getAdminSession()?.user.isAdmin);
}

export function isSuperAdminSignedIn(): boolean {
  return Boolean(getAdminSession()?.user.isSuperAdmin);
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_EMAIL_KEY);
}
