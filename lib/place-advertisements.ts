import { getPlaceAdvertisementsCollection, type PlaceAdvertisementDoc } from "@/lib/mongodb";

export type PlaceSectionAd = {
  id: string;
  provider: string;
  title: string;
  tagline: string;
  action: string;
  link: string;
  date: string;
  section: string;
};

function serialize(doc: PlaceAdvertisementDoc): PlaceSectionAd {
  return {
    id: String(doc._id),
    provider: doc.provider,
    title: doc.title,
    tagline: doc.tagline,
    action: doc.action,
    link: doc.link,
    date: doc.date ?? "",
    section: doc.section,
  };
}

const placeOnly = {
  $or: [{ visit_id: { $exists: false } }, { visit_id: "" }],
};

export async function listPlaceAdvertisements(placeId: string) {
  const ads = await getPlaceAdvertisementsCollection();
  const docs = await ads.find({ place_id: placeId, ...placeOnly }).sort({ title: 1 }).toArray();
  return docs.map(serialize);
}

export async function listVisitAdvertisements(placeId: string, visitId: string) {
  const ads = await getPlaceAdvertisementsCollection();
  const docs = await ads.find({ place_id: placeId, visit_id: visitId }).sort({ title: 1 }).toArray();
  return docs.map(serialize);
}
