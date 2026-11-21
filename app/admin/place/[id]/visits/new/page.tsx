import { notFound, redirect } from "next/navigation";
import { VisitForm } from "@/components/admin/VisitForm";
import { getAdminSession } from "@/lib/admin-auth";
import { loadAdminPlace, loadDirectoryOptions } from "@/lib/admin-place-form";

export const dynamic = "force-dynamic";

export default async function NewVisitPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const { id } = await params;
  const [place, counties] = await Promise.all([loadAdminPlace(id), loadDirectoryOptions("county")]);
  if (!place) notFound();
  const county = counties.find((row) => row.id === place.county_id)?.name ?? "";

  return <VisitForm placeName={place.name} placeId={id} county={county} visit={null} />;
}
