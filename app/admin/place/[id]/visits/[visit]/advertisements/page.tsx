import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import { AdvertisementManager, type AdvertisementRow } from "@/components/admin/AdvertisementManager";
import { getAdminSession } from "@/lib/admin-auth";
import { loadAdminPlace } from "@/lib/admin-place-form";
import { getPlaceAdvertisementsCollection, getPlaceVisitsCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export default async function VisitAdvertisementsPage({ params }: { params: Promise<{ id: string; visit: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const { id, visit: visitId } = await params;
  if (!/^[a-f0-9]{24}$/i.test(visitId)) notFound();
  const [place, visits, ads] = await Promise.all([loadAdminPlace(id), getPlaceVisitsCollection(), getPlaceAdvertisementsCollection()]);
  if (!place) notFound();
  const visit = await visits.findOne({ _id: new ObjectId(visitId), place_id: id });
  if (!visit) notFound();

  const docs = await ads.find({ place_id: id, visit_id: visitId }).sort({ date: -1 }).toArray();
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

  return <AdvertisementManager placeName={place.name} placeId={id} visitId={visitId} visitName={visit.name} rows={rows} />;
}
