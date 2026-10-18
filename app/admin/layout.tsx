import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  return (
    <div className="min-h-screen bg-white text-black">
      {session ? <AdminTopBar /> : null}
      {children}
    </div>
  );
}
