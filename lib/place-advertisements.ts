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

export async function listPlaceAdvertisements(placeId: string) {
  const ads = await getPlaceAdvertisementsCollection();
  const docs = await ads.find({ place_id: placeId }).sort({ title: 1 }).toArray();
  return docs.map(serialize);
}
