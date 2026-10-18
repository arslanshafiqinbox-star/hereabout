import { NextResponse } from "next/server";
import { listPublicPlaces } from "@/lib/public-places";
import { listPublicVisits } from "@/lib/public-visits";

export async function GET() {
  const [places, visits] = await Promise.all([listPublicPlaces(), listPublicVisits()]);
  return NextResponse.json({
    places: places.map((place) => ({
      id: place.id,
      name: place.name,
      type: place.type,
      county: place.county,
    })),
    visits: visits.map((visit) => ({
      id: visit.id,
      name: visit.name,
      activity: visit.activity,
      placeId: visit.place_id,
      placeName: visit.place_name,
    })),
  });
}
