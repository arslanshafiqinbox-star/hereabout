import {
  getSiteAdvertisementsCollection,
  type SiteAdvertisementDoc,
  type SiteAdvertisementSection,
} from "@/lib/mongodb";

export type SiteSponsor = {
  id: string;
  provider: string;
  title: string;
  tagline: string;
  action: string;
  link: string;
  date: string;
};

export type DirectorySponsor = SiteSponsor;

function serialize(doc: SiteAdvertisementDoc): SiteSponsor {
  return {
    id: String(doc._id),
    provider: doc.provider,
    title: doc.title,
    tagline: doc.tagline,
    action: doc.action,
    link: doc.link,
    date: doc.date ?? "",
  };
}

export async function listSiteSponsors(section: SiteAdvertisementSection) {
  const ads = await getSiteAdvertisementsCollection();
  const docs = await ads.find({ section, archived: { $ne: true } }).sort({ title: 1 }).toArray();
  const main = docs.find((doc) => doc.kind === "main") ?? null;
  return {
    main: main ? serialize(main) : null,
    sponsors: docs.filter((doc) => doc.kind !== "main").map(serialize),
  };
}

export function listDirectorySponsors() {
  return listSiteSponsors("directory");
}
