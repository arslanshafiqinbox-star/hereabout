import { getAdminFromCookies, toPublicUser } from "@/lib/auth";
import { getUsersCollection } from "@/lib/mongodb";

export async function listAccountsByAdminFlag(isAdmin: boolean) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return { ok: false as const, status: 401, message: "Admin sign in required." };
  }

  const users = await getUsersCollection();
  const docs = await users
    .find(isAdmin ? { isAdmin: true } : { isAdmin: { $ne: true } })
    .sort({ created_at: -1 })
    .toArray();

  return { ok: true as const, users: docs.map(toPublicUser) };
}
