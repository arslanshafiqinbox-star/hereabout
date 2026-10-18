import type { PublicUser } from "@/lib/auth-types";

export const USER_SESSION_KEY = "majlis_session";

export type UserSession = {
  token: string;
  user: PublicUser;
};

export function getUserSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(USER_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserSession;
    if (!parsed?.token || !parsed?.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setUserSession(session: UserSession) {
  sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
}

export function clearUserSession() {
  sessionStorage.removeItem(USER_SESSION_KEY);
}
