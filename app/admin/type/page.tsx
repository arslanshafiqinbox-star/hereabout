import { redirect } from "next/navigation";
import { EntityManager } from "@/components/admin/EntityManager";
import { getAdminSession } from "@/lib/admin-auth";
import { getDirectoryListCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export default async function TypePage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");
  const rows = await getDirectoryListCollection("type");
  const docs = await rows.find({}).sort({ name: 1 }).toArray();
  return (
    <EntityManager
      title="Type"
      endpoint="/api/admin/type"
      rows={docs.map((doc) => ({ id: doc.id, name: doc.name, description: doc.description }))}
    />
  );
}
