import { notFound, redirect } from "next/navigation";
import { AdvertisementManager, type AdvertisementRow } from "@/components/admin/AdvertisementManager";
import { getAdminSession } from "@/lib/admin-auth";
import { loadAdminPlace } from "@/lib/admin-place-form";
import { getPlaceAdvertisementsCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export default async function PlaceAdvertisementsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const { id } = await params;
  const place = await loadAdminPlace(id);
  if (!place) notFound();

  const ads = await getPlaceAdvertisementsCollection();
  const docs = await ads.find({ place_id: id }).sort({ date: -1 }).toArray();
  const rows: AdvertisementRow[] = docs.map((ad) => ({
    id: String(ad._id),
    provider: ad.provider,
    title: ad.title,
    tagline: ad.tagline,
    action: ad.action,
    link: ad.link,
    date: ad.date,
    section: ad.section,
    place_id: ad.place_id,
  }));

  return <AdvertisementManager placeName={place.name} placeId={id} rows={rows} />;
}
