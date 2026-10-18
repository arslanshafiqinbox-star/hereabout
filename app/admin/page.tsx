import { AdminHome } from "@/components/admin/AdminHome";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getAdminSession } from "@/lib/admin-auth";
import { getUsersCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try {
    const session = await getAdminSession();
    if (session) {
      return <AdminHome user={{ name: session.name, email: session.email, role: session.role }} />;
    }
    const users = await getUsersCollection();
    const adminCount = await users.countDocuments({ role: "admin" });
    return <AdminLogin mode={adminCount === 0 ? "setup" : "login"} />;
  } catch {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
        <h1 className="text-4xl tracking-[-0.04em]">The database is not reachable.</h1>
        <p className="mt-4 text-neutral-700">Check MONGODB_URI and try again.</p>
      </main>
    );
  }
}
