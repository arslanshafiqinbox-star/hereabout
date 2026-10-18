import { redirect } from "next/navigation";
import { SiteAdvertisementManager, type SiteAdvertisementRow } from "@/components/admin/SiteAdvertisementManager";
import { getAdminSession } from "@/lib/admin-auth";
import { getSiteAdvertisementsCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export default async function SiteAdvertisementPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const ads = await getSiteAdvertisementsCollection();
  const docs = await ads.find({}).sort({ title: 1 }).toArray();
  const rows: SiteAdvertisementRow[] = docs.map((ad) => ({
    id: String(ad._id),
    provider: ad.provider,
    title: ad.title,
    tagline: ad.tagline,
    action: ad.action,
    link: ad.link,
    date: ad.date ?? "",
    section: ad.section,
    kind: ad.kind === "main" ? "main" : "ad",
    archived: Boolean(ad.archived),
  }));

  return <SiteAdvertisementManager rows={rows} />;
}
