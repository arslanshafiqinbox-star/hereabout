import { placeSlug, type Place } from "@/lib/places";
import {
  getAdminPlacesCollection,
  getDirectoryListCollection,
  type PlaceScoreDoc,
} from "@/lib/mongodb";

export type PublicPlace = Place & { id: string };

export type FeaturedPlace = PublicPlace & {
  ourTake: string;
  comment: string;
  primary: string;
  secondary: string;
};

export type PublicPlaceType = "Village" | "Town" | "City";

function named(rows: { id: string; name: string }[], id: string) {
  return rows.find((row) => row.id === id)?.name ?? "";
}

function overall(score: PlaceScoreDoc | undefined) {
  if (!score) return 0;
  const total = score.character + score.food_drink + score.walks + score.getting_together + score.value;
  return Math.round((total / 5) * 10) / 10;
}

function knownType(name: string) {
  const match = ["Village", "Town", "City"].find((type) => type.toLowerCase() === name.trim().toLowerCase());
  return match ?? name;
}

export async function listPublicPlaces(type?: PublicPlaceType): Promise<PublicPlace[]> {
  const [places, types, counties, regions] = await Promise.all([
    getAdminPlacesCollection().then((collection) => collection.find({}).sort({ name: 1 }).toArray()),
    getDirectoryListCollection("type").then((collection) => collection.find({}).toArray()),
    getDirectoryListCollection("county").then((collection) => collection.find({}).toArray()),
    getDirectoryListCollection("region").then((collection) => collection.find({}).toArray()),
  ]);

  const rows = places.map((place) => ({
    id: String(place._id),
    name: place.name,
    summary: place.tagline,
    county: named(counties, place.county_id),
    region: named(regions, place.region_id),
    type: knownType(named(types, place.type_id)),
    score: overall(place.score),
  }));
  return type ? rows.filter((place) => place.type === type) : rows;
}

function plain(value: string | undefined) {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export async function findFeaturedPlace(): Promise<FeaturedPlace | null> {
  const [places, types, counties, regions] = await Promise.all([
    getAdminPlacesCollection().then((collection) => collection.findOne({ featured: true })),
    getDirectoryListCollection("type").then((collection) => collection.find({}).toArray()),
    getDirectoryListCollection("county").then((collection) => collection.find({}).toArray()),
    getDirectoryListCollection("region").then((collection) => collection.find({}).toArray()),
  ]);
  if (!places) return null;
  return {
    id: String(places._id),
    name: places.name,
    summary: places.tagline,
    county: named(counties, places.county_id),
    region: named(regions, places.region_id),
    type: knownType(named(types, places.type_id)),
    score: overall(places.score),
    ourTake: places.our_take,
    comment: places.comment_to_be_displayed,
    primary: plain(places.primary_des),
    secondary: plain(places.secondary_des),
  };
}

export async function findPublicPlace(idOrSlug: string): Promise<PublicPlace | null> {
  const places = await listPublicPlaces();
  if (/^[a-f0-9]{24}$/i.test(idOrSlug)) {
    return places.find((place) => place.id === idOrSlug) ?? null;
  }
  return places.find((place) => placeSlug(place.name) === idOrSlug) ?? null;
}
