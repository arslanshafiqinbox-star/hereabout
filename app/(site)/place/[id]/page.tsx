import { notFound, unstable_rethrow } from "next/navigation";
import { DatabaseNotice } from "@/components/DatabaseNotice";
import PlaceView from "@/components/PlaceView";
import { placeSlug, places } from "@/lib/places";
import { findPublicPlace } from "@/lib/public-places";
import { listPlaceAdvertisements } from "@/lib/place-advertisements";
import { listPublicVisits } from "@/lib/public-visits";

export const dynamic = "force-dynamic";

type PlacePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlacePage({ params }: PlacePageProps) {
  try {
  const { id } = await params;
  const fromDb = await findPublicPlace(id);
  const place =
    fromDb ?? places.find((item) => placeSlug(item.name) === id);
  if (!place) notFound();
  const [visits, advertisements] = fromDb
    ? await Promise.all([listPublicVisits(fromDb.id), listPlaceAdvertisements(fromDb.id)])
    : [undefined, []];

  return (
    <main>
      <PlaceView
        place={place}
        placeId={fromDb?.id}
        visits={visits}
        eatDrink={advertisements.filter((ad) => ad.section === "eat-drink")}
        events={advertisements.filter((ad) => ad.section === "events")}
      />
    </main>
  );
  } catch (error) {
    unstable_rethrow(error);
    console.error(error);
    return <DatabaseNotice />;
  }
}
