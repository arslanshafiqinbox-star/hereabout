import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getUsersCollection, type UserRole } from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";

const roles: UserRole[] = ["admin", "editor", "user"];

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json({ message: "Only an admin can add people." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  } | null;
  const name = body?.name?.trim() ?? "";
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  const role = roles.includes(body?.role as UserRole) ? (body?.role as UserRole) : null;
  if (!name || !email || password.length < 8 || !role) {
    return NextResponse.json(
      { message: "Name, email, a role, and a password of at least 8 characters are required." },
      { status: 400 },
    );
  }

  const users = await getUsersCollection();
  const existing = await users.findOne({ email });
  if (existing) {
    return NextResponse.json({ message: "That email is already in use." }, { status: 409 });
  }

  const now = new Date();
  await users.insertOne({
    name,
    email,
    businessName: name,
    businessEmail: null,
    passwordHash: await hashPassword(password),
    role,
    paymentStatus: false,
    isAdmin: role === "admin" || role === "editor",
    isSuperAdmin: role === "admin",
    created_at: now,
    updated_at: now,
  });

  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  const users = await getUsersCollection();
  const adminCount = await users.countDocuments({ role: "admin" });
  if (adminCount > 0) {
    return NextResponse.json({ message: "An admin already exists. Sign in instead." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    password?: string;
  } | null;
  const name = body?.name?.trim() ?? "";
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  if (!name || !email || password.length < 8) {
    return NextResponse.json(
      { message: "Name, email, and a password of at least 8 characters are required." },
      { status: 400 },
    );
  }

  const now = new Date();
  await users.insertOne({
    name,
    email,
    businessName: name,
    businessEmail: null,
    passwordHash: await hashPassword(password),
    role: "admin",
    paymentStatus: false,
    isAdmin: true,
    isSuperAdmin: true,
    created_at: now,
    updated_at: now,
  });

  return NextResponse.json({ ok: true });
}
