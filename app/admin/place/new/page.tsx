import { redirect } from "next/navigation";
import { PlaceForm } from "@/components/admin/PlaceForm";
import { getAdminSession } from "@/lib/admin-auth";
import { loadDirectoryOptions } from "@/lib/admin-place-form";

export const dynamic = "force-dynamic";

export default async function NewPlacePage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const [types, counties, regions] = await Promise.all([
    loadDirectoryOptions("type"),
    loadDirectoryOptions("county"),
    loadDirectoryOptions("region"),
  ]);

  return <PlaceForm place={null} types={types} counties={counties} regions={regions} />;
}
