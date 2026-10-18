import { notFound, redirect } from "next/navigation";
import { VisitManager, type VisitRow } from "@/components/admin/VisitManager";
import { getAdminSession } from "@/lib/admin-auth";
import { loadAdminPlace, loadDirectoryOptions } from "@/lib/admin-place-form";
import { getPlaceVisitsCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export default async function PlaceVisitsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const { id } = await params;
  const [place, counties] = await Promise.all([loadAdminPlace(id), loadDirectoryOptions("county")]);
  if (!place) notFound();
  const county = counties.find((row) => row.id === place.county_id)?.name ?? place.county_id;

  const visits = await getPlaceVisitsCollection();
  const docs = await visits.find({ place_id: id }).sort({ name: 1 }).toArray();
  const rows: VisitRow[] = docs.map((visit) => ({
    id: String(visit._id),
    name: visit.name,
    location: visit.location,
    tagline: visit.tagline,
    place_id: visit.place_id,
    county,
    activity: visit.activity,
    time: visit.time,
    cost: visit.cost,
  }));

  return <VisitManager placeName={place.name} placeId={id} county={county} rows={rows} />;
}
