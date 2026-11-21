import { notFound, unstable_rethrow } from "next/navigation";
import { DatabaseNotice } from "@/components/DatabaseNotice";
import VisitView, { type VisitArticleData } from "@/components/VisitView";
import { listVisitAdvertisements } from "@/lib/place-advertisements";
import { commentOverall, getPlaceCommentsCollection, type CommentRatingsDoc } from "@/lib/mongodb";
import { placeSlug, places } from "@/lib/places";
import { findPublicPlace } from "@/lib/public-places";
import { findPublicVisit, listPublicVisits } from "@/lib/public-visits";
import { findVisit, visitsFor } from "@/lib/visits";

export const dynamic = "force-dynamic";

type VisitPageProps = {
  params: Promise<{ id: string; visit: string }>;
};

const ratingFields: { key: keyof CommentRatingsDoc; label: string }[] = [
  { key: "character", label: "Setting" },
  { key: "value", label: "Value" },
  { key: "food_drink", label: "Family-friendliness" },
  { key: "walks", label: "Peace and quiet" },
  { key: "getting_around", label: "Worth the trip" },
];

async function visitRatings(placeId: string) {
  const comments = await getPlaceCommentsCollection();
  const docs = await comments.find({ place_id: placeId, approval: true, visit_id: { $type: "string", $ne: "" } }).toArray();
  const grouped = new Map<string, typeof docs>();
  for (const doc of docs) {
    const key = doc.visit_id ?? "";
    const list = grouped.get(key) ?? [];
    list.push(doc);
    grouped.set(key, list);
  }
  function summarize(visitId: string) {
    const rows = grouped.get(visitId) ?? [];
    if (rows.length === 0) return { score: null as number | null, ratings: [] as { label: string; score: number }[] };
    const average = (pick: (ratings: CommentRatingsDoc) => number) =>
      Math.round((rows.reduce((sum, doc) => sum + pick(doc.ratings), 0) / rows.length) * 10) / 10;
    const score = Math.round((rows.reduce((sum, doc) => sum + (doc.overall ?? commentOverall(doc.ratings)), 0) / rows.length) * 10) / 10;
    return {
      score,
      ratings: ratingFields.map((field) => ({ label: field.label, score: average((ratings) => ratings[field.key]) })),
    };
  }
  return summarize;
}

export default async function VisitPage({ params }: VisitPageProps) {
  const { id, visit: visitId } = await params;

  if (/^[a-f0-9]{24}$/i.test(id) && /^[a-f0-9]{24}$/i.test(visitId)) {
    try {
      const visit = await findPublicVisit(id, visitId);
      if (!visit) notFound();
      const [place, siblings, ads, ratings] = await Promise.all([
        findPublicPlace(id),
        listPublicVisits(id),
        listVisitAdvertisements(id, visitId),
        visitRatings(id),
      ]);
      const rated = ratings(visitId);
      const placeScore = place && place.score > 0 ? place.score : null;
      const data: VisitArticleData = {
        id: visit.id,
        title: visit.name,
        text: visit.tagline,
        kind: visit.activity,
        time: visit.time,
        price: visit.cost,
        bestTime: visit.best_time,
        mapUrl: visit.location,
        station: visit.closest_station,
        stationHref: visit.closest_station_location,
        goIf: visit.go_if,
        skipIf: visit.skip_if,
        video: visit.video,
        placeName: place?.name || visit.place_name,
        placeHref: `/place/${id}`,
        county: place?.county || visit.county,
        region: place?.region || "",
        score: rated.score,
        ratings: rated.ratings,
        article: visit.article,
        placeId: id,
        others: [
          { title: `Our review of ${place?.name || visit.place_name}`, href: `/place/${id}`, score: placeScore },
          ...siblings.map((item) => ({
            title: item.name,
            href: `/place/${id}/visit/${item.id}`,
            score: ratings(item.id).score,
          })),
        ],
        hero: ads.filter((ad) => ad.section === "hero"),
        between: ads.filter((ad) => ad.section === "between-of-places"),
        eat: ads.filter((ad) => ad.section === "eat-drink"),
        events: ads.filter((ad) => ad.section === "events"),
      };
      return (
        <main>
          <VisitView visit={data} />
        </main>
      );
    } catch (error) {
      unstable_rethrow(error);
      console.error(error);
      return <DatabaseNotice />;
    }
  }

  const place = places.find((item) => placeSlug(item.name) === id);
  const visit = place ? findVisit(place.name, visitId) : null;
  if (!place || !visit) notFound();
  const data: VisitArticleData = {
    id: visitId,
    title: visit.title,
    text: visit.text,
    kind: visit.kind,
    time: visit.time,
    price: visit.price,
    bestTime: "",
    mapUrl: "",
    station: "",
    stationHref: "",
    goIf: [],
    skipIf: [],
    video: "",
    placeName: place.name,
    placeHref: `/place/${id}`,
    county: place.county,
    region: place.region,
    score: null,
    ratings: [],
    article: "",
    others: [
      { title: `Our review of ${place.name}`, href: `/place/${id}`, score: place.score },
      ...visitsFor(place.name).map((item) => ({
        title: item.title,
        href: `/place/${id}/visit/${placeSlug(item.title)}`,
        score: null,
      })),
    ],
    hero: [],
    between: [],
    eat: [],
    events: [],
  };
  return (
    <main>
      <VisitView visit={data} />
    </main>
  );
}
