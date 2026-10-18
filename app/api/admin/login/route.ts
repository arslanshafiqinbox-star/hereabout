import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions, signAdminToken } from "@/lib/admin-auth";
import { getUsersCollection } from "@/lib/mongodb";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  const users = await getUsersCollection();
  const user = await users.findOne({ email });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ message: "Those details do not match." }, { status: 401 });
  }
  if (user.role !== "admin" && user.role !== "editor") {
    return NextResponse.json({ message: "This account cannot open the admin." }, { status: 403 });
  }

  const token = signAdminToken({
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  });
  const response = NextResponse.json({
    user: { name: user.name, email: user.email, role: user.role },
  });
  response.cookies.set(ADMIN_COOKIE, token, adminCookieOptions());
  return response;
}
