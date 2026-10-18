import { redirect } from "next/navigation";
import { PlaceManager, type PlaceRow } from "@/components/admin/PlaceManager";
import { getAdminSession } from "@/lib/admin-auth";
import { loadDirectoryOptions } from "@/lib/admin-place-form";
import { getAdminPlacesCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export default async function AdminPlacePage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const [types, counties, regions, places] = await Promise.all([
    loadDirectoryOptions("type"),
    loadDirectoryOptions("county"),
    loadDirectoryOptions("region"),
    getAdminPlacesCollection().then((collection) => collection.find({}).sort({ name: 1 }).toArray()),
  ]);

  const typeName = new Map(types.map((row) => [row.id, row.name]));
  const countyName = new Map(counties.map((row) => [row.id, row.name]));
  const regionName = new Map(regions.map((row) => [row.id, row.name]));

  const rows: PlaceRow[] = places.map((place) => ({
    id: String(place._id),
    name: place.name,
    tagline: place.tagline,
    type_id: place.type_id,
    county_id: place.county_id,
    region_id: place.region_id,
    type_name: typeName.get(place.type_id) ?? place.type_id,
    county_name: countyName.get(place.county_id) ?? place.county_id,
    region_name: regionName.get(place.region_id) ?? place.region_id,
    local_authority: place.local_authority,
    closest_station: place.closest_station,
    closest_station_location: place.closest_station_location ?? "",
    score: place.score,
    our_take: place.our_take,
    comment_to_be_displayed: place.comment_to_be_displayed,
    primary_des: place.primary_des ?? "",
    secondary_des: place.secondary_des ?? "",
    featured: place.featured === true,
  }));

  return <PlaceManager rows={rows} />;
}
