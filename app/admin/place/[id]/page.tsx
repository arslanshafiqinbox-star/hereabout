import { notFound, redirect } from "next/navigation";
import { PlaceForm } from "@/components/admin/PlaceForm";
import type { PlaceRow } from "@/components/admin/PlaceManager";
import { getAdminSession } from "@/lib/admin-auth";
import { loadAdminPlace, loadDirectoryOptions } from "@/lib/admin-place-form";

export const dynamic = "force-dynamic";

export default async function EditPlacePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const { id } = await params;
  const [place, types, counties, regions] = await Promise.all([
    loadAdminPlace(id),
    loadDirectoryOptions("type"),
    loadDirectoryOptions("county"),
    loadDirectoryOptions("region"),
  ]);
  if (!place) notFound();

  const row: PlaceRow = {
    id: String(place._id),
    name: place.name,
    tagline: place.tagline,
    type_id: place.type_id,
    county_id: place.county_id,
    region_id: place.region_id,
    type_name: "",
    county_name: "",
    region_name: "",
    local_authority: place.local_authority,
    closest_station: place.closest_station,
    closest_station_location: place.closest_station_location ?? "",
    score: place.score,
    our_take: place.our_take,
    comment_to_be_displayed: place.comment_to_be_displayed,
    primary_des: place.primary_des ?? "",
    secondary_des: place.secondary_des ?? "",
    featured: place.featured === true,
  };

  return <PlaceForm place={row} types={types} counties={counties} regions={regions} />;
}
