import { ObjectId } from "mongodb";
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
  article: string;
  best_time: string;
  go_if: string[];
  skip_if: string[];
  video: string;
  closest_station: string;
  closest_station_location: string;
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
    article: doc.article ?? "",
    best_time: doc.best_time ?? "",
    go_if: doc.go_if ?? [],
    skip_if: doc.skip_if ?? [],
    video: doc.video ?? "",
    closest_station: doc.closest_station ?? "",
    closest_station_location: doc.closest_station_location ?? "",
  };
}

export async function findPublicVisit(placeId: string, visitId: string) {
  if (!/^[a-f0-9]{24}$/i.test(placeId) || !/^[a-f0-9]{24}$/i.test(visitId)) return null;
  const collection = await getPlaceVisitsCollection();
  const doc = await collection.findOne({ _id: new ObjectId(visitId), place_id: placeId });
  if (!doc) return null;
  const places = await getAdminPlacesCollection();
  const place = await places.findOne({ _id: new ObjectId(placeId) }, { projection: { name: 1 } });
  return serialize(doc, place?.name ?? "");
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
