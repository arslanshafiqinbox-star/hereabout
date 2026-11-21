import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import { VisitForm } from "@/components/admin/VisitForm";
import type { VisitRow } from "@/components/admin/VisitManager";
import { getAdminSession } from "@/lib/admin-auth";
import { loadAdminPlace, loadDirectoryOptions } from "@/lib/admin-place-form";
import { getPlaceVisitsCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export default async function EditVisitPage({ params }: { params: Promise<{ id: string; visit: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const { id, visit: visitId } = await params;
  if (!/^[a-f0-9]{24}$/i.test(visitId)) notFound();

  const [place, counties, visits] = await Promise.all([
    loadAdminPlace(id),
    loadDirectoryOptions("county"),
    getPlaceVisitsCollection(),
  ]);
  if (!place) notFound();
  const doc = await visits.findOne({ _id: new ObjectId(visitId), place_id: id });
  if (!doc) notFound();

  const county = counties.find((row) => row.id === place.county_id)?.name ?? doc.county;
  const row: VisitRow = {
    id: String(doc._id),
    name: doc.name,
    location: doc.location,
    tagline: doc.tagline,
    place_id: doc.place_id,
    county,
    activity: doc.activity,
    time: doc.time,
    cost: doc.cost,
    article: doc.article ?? "",
    bestTime: doc.best_time ?? "",
    goIf: doc.go_if ?? [],
    skipIf: doc.skip_if ?? [],
    video: doc.video ?? "",
    closestStation: doc.closest_station ?? "",
    closestStationLocation: doc.closest_station_location ?? "",
  };

  return <VisitForm placeName={place.name} placeId={id} county={county} visit={row} />;
}
