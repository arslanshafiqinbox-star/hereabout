import { redirect } from "next/navigation";
import { EntityManager } from "@/components/admin/EntityManager";
import { getAdminSession } from "@/lib/admin-auth";
import { getDirectoryListCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export default async function RegionPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");
  const rows = await getDirectoryListCollection("region");
  const docs = await rows.find({}).sort({ name: 1 }).toArray();
  return (
    <EntityManager
      title="Region"
      endpoint="/api/admin/region"
      rows={docs.map((doc) => ({ id: doc.id, name: doc.name, description: doc.description }))}
    />
  );
}
