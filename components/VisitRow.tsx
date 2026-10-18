import Link from "next/link";
import { placeSlug } from "@/lib/places";
import type { ListedVisit } from "@/lib/visits";

const sans =
  "var(--font-bricolage), system-ui, -apple-system, 'Segoe UI', sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";
const serif = "var(--font-newsreader), Georgia, 'Times New Roman', serif";

function mapLink(location: string | undefined, fallback: string) {
  const value = location?.trim() || fallback;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
}

export default function VisitRow({ visit, letter }: { visit: ListedVisit; letter: string }) {
  const mapHref = mapLink(visit.mapUrl, `${visit.title}, ${visit.placeName}`);

  return (
    <article className="grid grid-cols-[2.5rem_minmax(0,1fr)] border-b-2 border-black lg:grid-cols-[3.5rem_minmax(0,1.7fr)_12rem_9rem_8rem_6.5rem]">
      <div
        className="flex items-start justify-center border-r-2 border-black pt-4 text-[1.45rem] leading-none lg:items-center lg:pt-0 lg:text-[1.7rem]"
        style={{ fontFamily: sans, fontWeight: 800 }}
      >
        {letter}
      </div>
      <div className="min-w-0 px-3 py-4 sm:px-5 sm:py-5 lg:contents">
        <div className="lg:px-5 lg:py-5">
          <h3
            className="text-[1.25rem] leading-none tracking-[-0.03em] break-words sm:text-[1.35rem]"
            style={{ fontFamily: sans, fontWeight: 800 }}
          >
            {visit.title}
          </h3>
          <p
            className="mt-1.5 max-w-[36rem] text-[15px] leading-snug"
            style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 500 }}
          >
            {visit.text}
          </p>
          <a
            href={mapHref}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[14px] underline"
            style={{ fontFamily: sans }}
          >
            Map <span aria-hidden="true">↗</span>
          </a>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] lg:hidden" style={{ fontFamily: sans }}>
            <Link
              href={`/place/${visit.placeId || placeSlug(visit.placeName)}`}
              className="underline"
              style={{ fontWeight: 700 }}
            >
              {visit.placeName}
            </Link>
            <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-600" style={{ fontFamily: mono }}>
              {visit.county}
            </span>
            <span>{visit.kind}</span>
            <span>{visit.time}</span>
            <span>{visit.price}</span>
          </div>
        </div>
        <div className="hidden flex-col justify-center px-5 py-5 lg:flex">
          <Link
            href={`/place/${visit.placeId || placeSlug(visit.placeName)}`}
            className="text-[15px] underline"
            style={{ fontFamily: sans, fontWeight: 700 }}
          >
            {visit.placeName}
          </Link>
          <p
            className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-neutral-600"
            style={{ fontFamily: mono, fontWeight: 500 }}
          >
            {visit.county}
          </p>
        </div>
        <p className="hidden items-center px-5 py-5 text-[15px] lg:flex" style={{ fontFamily: sans }}>
          {visit.kind}
        </p>
        <p className="hidden items-center px-5 py-5 text-[15px] lg:flex" style={{ fontFamily: sans }}>
          {visit.time}
        </p>
        <p className="hidden items-center px-5 py-5 text-[15px] lg:flex" style={{ fontFamily: sans }}>
          {visit.price}
        </p>
      </div>
    </article>
  );
}
