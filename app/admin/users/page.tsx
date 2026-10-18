import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { getUsersCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const sans = "var(--font-bricolage), system-ui, sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const users = await getUsersCollection();
  const docs = await users
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ name: 1 })
    .toArray();

  return (
    <main className="px-5 py-10 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: mono }}>
        {docs.length} {docs.length === 1 ? "person" : "people"}
      </p>
      <h1 className="mt-2 text-5xl leading-none tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 560 }}>
        Users
      </h1>
      <div className="mt-8 overflow-x-auto border-2 border-black">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-black bg-neutral-50">
              {["Name", "Email", "Role", "Added"].map((heading) => (
                <th
                  key={heading}
                  className="border-r-2 border-black px-4 py-3 text-[11px] uppercase tracking-[0.14em] last:border-r-0"
                  style={{ fontFamily: mono, fontWeight: 500 }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-sm" style={{ fontFamily: sans }}>
                  No users yet.
                </td>
              </tr>
            ) : (
              docs.map((user) => (
                <tr key={String(user._id)} className="border-b-2 border-black last:border-b-0">
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans, fontWeight: 600 }}>
                    {user.name}
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                    {user.email}
                  </td>
                  <td className="border-r-2 border-black px-4 py-3 uppercase" style={{ fontFamily: mono }}>
                    {user.role}
                  </td>
                  <td className="px-4 py-3" style={{ fontFamily: sans }}>
                    {user.created_at.toISOString().slice(0, 10)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
