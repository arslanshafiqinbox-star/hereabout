import { NextResponse } from "next/server";
import { getAdminPlacesCollection, type AdminPlaceDoc } from "@/lib/mongodb";

function serialize(doc: AdminPlaceDoc) {
  return {
    id: String(doc._id),
    name: doc.name,
    tagline: doc.tagline,
    type_id: doc.type_id,
    county_id: doc.county_id,
    region_id: doc.region_id,
    local_authority: doc.local_authority,
    closest_station: doc.closest_station,
    closest_station_location: doc.closest_station_location,
    score: doc.score,
    our_take: doc.our_take,
    comment_to_be_displayed: doc.comment_to_be_displayed,
    primary_des: doc.primary_des,
    secondary_des: doc.secondary_des,
    featured: doc.featured === true,
  };
}

export async function GET() {
  const places = await getAdminPlacesCollection();
  const docs = await places.find({}).sort({ name: 1 }).toArray();
  return NextResponse.json({ places: docs.map(serialize) });
}
