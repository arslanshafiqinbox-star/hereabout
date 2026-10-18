import Link from "next/link";
import { notFound } from "next/navigation";
import { placeSlug, places } from "@/lib/places";
import { findVisit } from "@/lib/visits";

type VisitPageProps = {
  params: Promise<{ id: string; visit: string }>;
};

export default async function VisitPage({ params }: VisitPageProps) {
  const { id, visit: visitId } = await params;
  const place = places.find((item) => placeSlug(item.name) === id);
  const visit = place ? findVisit(place.name, visitId) : null;
  if (!place || !visit) notFound();

  return (
    <main className="bg-white text-black">
      <article className="border-b-2 border-black px-5 py-10 sm:px-8 lg:px-10">
        <p
          className="text-[11px] uppercase tracking-[0.12em]"
          style={{ fontFamily: "var(--font-plex-mono), ui-monospace, monospace", fontWeight: 500 }}
        >
          <Link href={`/place/${id}`} className="underline">
            {place.name}
          </Link>
          {" / "}
          {visit.title}
        </p>
        <h1
          className="mt-4 max-w-[16ch] text-[clamp(2.8rem,6vw,4.5rem)] leading-[0.9] tracking-[-0.045em]"
          style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif", fontWeight: 800 }}
        >
          {visit.title}
        </h1>
        <p
          className="mt-4 max-w-[28rem] text-[1.35rem] leading-snug"
          style={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontStyle: "italic", fontWeight: 500 }}
        >
          {visit.text}
        </p>
        <p
          className="mt-6 text-[12px] uppercase tracking-[0.1em]"
          style={{ fontFamily: "var(--font-plex-mono), ui-monospace, monospace", fontWeight: 500 }}
        >
          {visit.kind}
          {visit.time ? ` · ${visit.time}` : ""}
          {visit.price ? ` · ${visit.price}` : ""}
        </p>
      </article>
    </main>
  );
}
