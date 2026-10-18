import { getAdminPlacesCollection, getPlaceVisitsCollection, type PlaceVisitDoc } from "@/lib/mongodb";

export type PublicVisit = {
  id: string;
  name: string;
  location: string;
  tagline: string;
  place_id: string;
  place_name: string;
  county: string;
  activity: string;
  time: string;
  cost: string;
};

function serialize(doc: PlaceVisitDoc, placeName: string): PublicVisit {
  return {
    id: String(doc._id),
    name: doc.name,
    location: doc.location,
    tagline: doc.tagline,
    place_id: doc.place_id,
    place_name: placeName,
    county: doc.county,
    activity: doc.activity,
    time: doc.time,
    cost: doc.cost,
  };
}

export async function listPublicVisits(placeId?: string) {
  const [visits, places] = await Promise.all([
    getPlaceVisitsCollection().then((collection) =>
      collection
        .find(placeId ? { place_id: placeId } : {})
        .sort({ name: 1 })
        .toArray(),
    ),
    getAdminPlacesCollection().then((collection) => collection.find({}, { projection: { name: 1 } }).toArray()),
  ]);
  const placeName = new Map(places.map((place) => [String(place._id), place.name]));
  return visits.map((visit) => serialize(visit, placeName.get(visit.place_id) ?? ""));
}
