"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import PlaceComments from "@/components/PlaceComments";
import type { Place } from "@/lib/places";
import type { PlaceSectionAd } from "@/lib/place-advertisements";
import type { PublicVisit } from "@/lib/public-visits";
import { visitAdsFor, visitsFor, type ListedVisit } from "@/lib/visits";
import VisitRow from "@/components/VisitRow";

const sans =
  "var(--font-bricolage), system-ui, -apple-system, 'Segoe UI', sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";
const serif = "var(--font-newsreader), Georgia, 'Times New Roman', serif";

const scores = [
  { label: "Character", score: 4.2 },
  { label: "Food & drink", score: 4.5 },
  { label: "Walks", score: 4.9 },
  { label: "Getting around", score: 4.4 },
  { label: "Value", score: 4.5 },
];

const visitFilters = ["All", "History", "Walks", "Family", "Free", "Rainy day"];

function adHref(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function adCard(ad: PlaceSectionAd) {
  return {
    id: ad.id,
    kind: ad.provider,
    title: ad.title,
    text: ad.tagline,
    action: ad.action,
    href: adHref(ad.link),
    date: ad.date || undefined,
  };
}

export default function PlaceView({
  place,
  visits: liveVisits,
  eatDrink = [],
  events = [],
  placeId,
}: {
  place: Place;
  visits?: PublicVisit[];
  eatDrink?: PlaceSectionAd[];
  events?: PlaceSectionAd[];
  placeId?: string;
}) {
  const [filter, setFilter] = useState("All");
  const [copied, setCopied] = useState(false);
  const featured = place.name === "Alnmouth";
  const catalogue: ListedVisit[] =
    liveVisits !== undefined
      ? liveVisits.map((visit) => ({
          id: visit.id,
          title: visit.name,
          text: visit.tagline,
          kind: visit.activity,
          time: visit.time,
          price: visit.cost,
          tags: [],
          placeName: visit.place_name || place.name,
          county: visit.county || place.county,
          mapUrl: visit.location,
        }))
      : visitsFor(place.name).map((visit) => ({ ...visit, placeName: place.name, county: place.county }));
  const visits =
    catalogue.length || liveVisits !== undefined
      ? catalogue
      : [
          {
            title: place.name,
            text: place.summary,
            kind: place.type,
            time: "",
            price: "",
            tags: [] as string[],
            placeName: place.name,
            county: place.county,
          },
        ];
  const shown = visits.filter((item) => matchesVisit(item, filter));
  const ads = visitAdsFor(place.name);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="bg-white text-black">
      <header className="border-b-2 border-black">
        <p
          className="border-b-2 border-black px-5 py-3 text-[11px] uppercase tracking-[0.16em] sm:px-8 lg:px-10"
          style={{ fontFamily: mono, fontWeight: 500 }}
        >
          <Link href="/directory" className="hover:underline">
            Directory
          </Link>
          {" / "}
          {place.region}
          {" / "}
          {place.county}
          {" / "}
          {place.name}
        </p>
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_32rem]">
          <div className="px-5 py-6 sm:px-8 lg:border-r-2 lg:border-black lg:px-10 lg:py-8">
            <h1
              className="text-[clamp(6rem,10vw,10rem)] leading-[0.78] tracking-[-0.05em]"
              style={{ fontFamily: sans, fontWeight: 800 }}
            >
              {place.name}
            </h1>
            <p
              className="mt-4 max-w-[27ch] text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.02]"
              style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 500 }}
            >
              {place.summary}
            </p>
          </div>
          <div className="px-6 py-6 sm:px-8 lg:px-8 lg:py-8">
            <dl>
              <Fact label="Type" value={place.type} />
              <Fact label="County" value={place.county} />
              <Fact label="Region" value={place.region} />
              <Fact label="Local authority" value={place.county} />
              <Fact
                label="Closest station"
                value={featured ? "Alnmouth station" : "See National Rail"}
                href={featured ? "https://www.nationalrail.co.uk/" : undefined}
              />
              <Fact label="Reader score" value={`${place.score.toFixed(1)} / 5`} last />
            </dl>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b-2 border-black px-4 py-3">
        <span
          className="shrink-0 pr-2 text-[11px] uppercase tracking-[0.12em]"
          style={{ fontFamily: mono, fontWeight: 500 }}
        >
          Share
        </span>
        {["Facebook", "X", "WhatsApp", "Bluesky", "LinkedIn", "Reddit", "Email"].map((name) => (
          <span
            key={name}
            className="shrink-0 border border-black px-2.5 py-1 text-[13px]"
            style={{ fontFamily: sans }}
          >
            {name}
          </span>
        ))}
        <button
          type="button"
          onClick={copyLink}
          className="shrink-0 border border-black px-2.5 py-1 text-[13px]"
          style={{ fontFamily: sans }}
        >
          {copied ? "Copied" : "Copy link"}
        </button>
        <button
          type="button"
          className="shrink-0 bg-black px-2.5 py-1 text-[13px] text-white"
          style={{ fontFamily: sans, fontWeight: 600 }}
        >
          Share…
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)_18.5rem]">
        <aside className="border-b-2 border-black px-5 py-6 lg:border-r-2 lg:border-b-0">
          <p
            className="text-[11px] uppercase tracking-[0.12em]"
            style={{ fontFamily: mono, fontWeight: 500 }}
          >
            How readers scored it
          </p>
          <ul className="mt-4">
            {(featured ? scores : [{ label: "Overall", score: place.score }]).map((row) => (
              <li key={row.label} className="border-t border-black py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[15px]" style={{ fontFamily: sans, fontWeight: 600 }}>
                    {row.label}
                  </span>
                  <span className="text-[15px]" style={{ fontFamily: sans }}>
                    {row.score.toFixed(1)}
                  </span>
                </div>
                <ScoreBar score={row.score} />
              </li>
            ))}
          </ul>
        </aside>

        <div className="border-b-2 border-black px-5 py-6 sm:px-8 lg:border-r-2 lg:border-b-0 lg:py-8">
          <div className="max-w-[40rem] space-y-4 text-[16px] leading-relaxed" style={{ fontFamily: sans }}>
            {featured ? (
              <>
                <p>
                  Brightly painted houses face the River Aln and a long sandy beach. It feels like a
                  seaside village that has not got the memo about crowds.
                </p>
                <p>Walk the beach and dunes, then follow the coast path towards Warkworth.</p>
              </>
            ) : (
              <p>{place.summary}</p>
            )}
          </div>
          <div className="mt-6 max-w-[40rem] border border-black px-4 py-3">
            <p
              className="text-[11px] uppercase tracking-[0.12em]"
              style={{ fontFamily: mono, fontWeight: 500 }}
            >
              Our take
            </p>
            <p className="mt-1 text-[16px]" style={{ fontFamily: sans, fontWeight: 600 }}>
              {featured
                ? "The estuary does most of the work and asks for nothing. Bring a flask."
                : `${place.name} is worth the detour.`}
            </p>
          </div>
          {featured ? (
            <>
              <p className="mt-6 max-w-[40rem] text-[16px] leading-relaxed" style={{ fontFamily: sans }}>
                Readers rate Alnmouth highest for walks (4.9) and lowest for character (4.2). The
                score comes from 118 verdicts, and the comments will show you exactly where they
                disagree.
              </p>
              <blockquote
                className="mt-8 max-w-[36rem] text-[clamp(1.7rem,3vw,2.4rem)] leading-[1.05] tracking-[-0.03em]"
                style={{ fontFamily: sans, fontWeight: 800 }}
              >
                “Live nearby. Go for “The beach walk to Warkworth” and let the rest of the day
                wander.”
              </blockquote>
              <p
                className="mt-3 text-[11px] uppercase tracking-[0.12em]"
                style={{ fontFamily: mono, fontWeight: 500 }}
              >
                From the comments · Lives here
              </p>
            </>
          ) : null}
        </div>

        <aside className="px-4 py-6">
          <p
            className="text-[11px] uppercase tracking-[0.12em]"
            style={{ fontFamily: mono, fontWeight: 500 }}
          >
            On this page
          </p>
          <div className="mt-3 border-2 border-black">
            <PageLink href="#places-to-visit" label="Places to visit" />
            <PageLink href="#eat-drink" label="Eat, drink and stay" />
            <PageLink href="#events" label="Events, holidays and things to do" last />
          </div>
          <a
            href="#comments"
            className="mt-3 block w-full bg-black px-3 py-2.5 text-center text-[14px] text-white"
            style={{ fontFamily: sans, fontWeight: 600 }}
          >
            Comment on {place.name}
          </a>
          <div className="mt-4 space-y-4">
            <MiniAd
              category="Restaurant"
              place={place.name}
              title="Marram & Sons"
              body="Wood-fired seafood and seasonal veg, cooked where you can see it."
              action="Book a table"
            />
            <MiniAd
              category="Festival"
              place={place.name}
              title="Old Quay Food Fair"
              date="7 November"
              body="Local producers, cooking demos and a very long queue for pies."
              action="Get tickets"
            />
          </div>
        </aside>
      </div>

      <section id="places-to-visit" className="scroll-mt-6 border-t-2 border-black">
        <div
          className="flex items-center justify-between bg-black px-5 py-2.5 text-[11px] uppercase tracking-[0.12em] text-white"
          style={{ fontFamily: mono, fontWeight: 500 }}
        >
          <p>Places to visit in {place.name}</p>
          <p>
            {shown.length} {shown.length === 1 ? "place" : "places"}
          </p>
        </div>
        {catalogue.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-b border-black px-4 py-3">
            {visitFilters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`shrink-0 border border-black px-3 py-1 text-[14px] ${
                  filter === item ? "bg-black text-white" : "bg-white"
                }`}
                style={{ fontFamily: sans, fontWeight: 500 }}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
        {shown.map((item, index) => {
          const letter = item.title.charAt(0).toUpperCase();
          const previous = shown[index - 1]?.title.charAt(0).toUpperCase();
          const row = item;
          const ad = ads.find(
            (entry) => entry.after === item.title && (filter === "All" || entry.tags.includes(filter)),
          );
          return (
            <Fragment key={item.id ?? item.title}>
              <VisitRow visit={row} letter={letter !== previous ? letter : ""} />
              {ad ? (
                <div className="flex flex-wrap items-center gap-4 border-b border-black px-5 py-3.5">
                  <p
                    className="bg-[#FFE14A] px-3 py-2 text-[10px] uppercase leading-tight tracking-[0.08em]"
                    style={{ fontFamily: mono, fontWeight: 500 }}
                  >
                    Advertisement
                    <br />
                    {ad.category}
                  </p>
                  <p className="min-w-0 flex-1 text-[15px] leading-snug" style={{ fontFamily: sans }}>
                    <span className="text-[1.35rem] tracking-[-0.03em]" style={{ fontWeight: 800 }}>
                      {ad.title}
                    </span>{" "}
                    {ad.text}
                  </p>
                  <button
                    type="button"
                    className="border border-black bg-white px-3 py-1.5 text-[14px]"
                    style={{ fontFamily: sans }}
                  >
                    {ad.action}
                  </button>
                </div>
              ) : null}
            </Fragment>
          );
        })}
        {shown.length === 0 ? (
          <p className="px-5 py-8 text-[15px]" style={{ fontFamily: sans }}>
            No places to visit yet.
          </p>
        ) : null}
      </section>

      <div
        className="flex items-center justify-between gap-4 px-5 py-2 text-[11px] uppercase tracking-[0.08em]"
        style={{ fontFamily: mono, fontWeight: 500 }}
      >
        <p>Opening times and prices change. Check the official site or the map link before you go.</p>
        <button type="button" className="shrink-0 underline" style={{ fontFamily: sans, fontWeight: 600, letterSpacing: "0" }}>
          Suggest a place
        </button>
      </div>

      <AdBand
        id="eat-drink"
        kicker={`Eat, drink and stay in ${place.name}`}
        cards={eatDrink.map(adCard)}
        pitch="Restaurants, cafés, hotels and B&Bs: reach people deciding where to go next."
      />
      <AdBand
        id="events"
        kicker={`Events, holidays and things to do in ${place.name}`}
        cards={events.map(adCard)}
        pitch="Events, holidays and things to do: reach people planning their next trip."
      />
      <PlaceComments placeName={place.name} placeId={placeId} />
    </article>
  );
}

function matchesVisit(visit: ListedVisit, filter: string) {
  if (filter === "All") return true;
  if (visit.tags.includes(filter)) return true;
  if (filter === "Free") return /free/i.test(visit.price);
  if (filter === "Walks") return /walk/i.test(visit.kind) || /walk/i.test(visit.title);
  return visit.kind.toLowerCase() === filter.toLowerCase();
}

function Fact({
  label,
  value,
  href,
  last,
}: {
  label: string;
  value: string;
  href?: string;
  last?: boolean;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-8 py-3 ${last ? "" : "border-b border-neutral-300"}`}>
      <dt
        className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-neutral-500"
        style={{ fontFamily: mono, fontWeight: 500 }}
      >
        {label}
      </dt>
      <dd className="text-right text-[16px] leading-none" style={{ fontFamily: sans, fontWeight: 600 }}>
        {href ? (
          <a href={href} className="underline" target="_blank" rel="noreferrer">
            {value} <span aria-hidden="true">↗</span>
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const filled = Math.round((score / 5) * 5);
  return (
    <div className="mt-2 flex max-w-[7.5rem] gap-1" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={`h-2 flex-1 ${index < filled ? "bg-[#2F8F4E]" : "bg-[#e5e5e5]"}`}
        />
      ))}
    </div>
  );
}

function PageLink({ href, label, last }: { href: string; label: string; last?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-3 py-2.5 text-[15px] ${last ? "" : "border-b border-black"}`}
      style={{ fontFamily: sans }}
    >
      {label}
      <span aria-hidden="true">↓</span>
    </Link>
  );
}

function MiniAd({
  category,
  place,
  title,
  date,
  body,
  action,
}: {
  category: string;
  place: string;
  title: string;
  date?: string;
  body: string;
  action: string;
}) {
  return (
    <article className="border border-black">
      <div
        className="flex items-center justify-between bg-[#FFE14A] px-3 py-1 text-[10px] uppercase tracking-[0.1em]"
        style={{ fontFamily: mono, fontWeight: 500 }}
      >
        <span>Advertisement</span>
        <span>
          {category} · {place}
        </span>
      </div>
      <div className="px-3 py-3">
        <h3 className="text-[1.45rem] leading-none tracking-[-0.03em]" style={{ fontFamily: sans, fontWeight: 800 }}>
          {title}
        </h3>
        {date ? (
          <span
            className="mt-2 inline-block bg-black px-1.5 py-1 text-[10px] uppercase tracking-[0.08em] text-white"
            style={{ fontFamily: mono }}
          >
            {date}
          </span>
        ) : null}
        <p className="mt-2 text-[14px] leading-snug" style={{ fontFamily: sans }}>
          {body}
        </p>
        <button type="button" className="mt-3 border border-black px-3 py-1.5 text-[14px]" style={{ fontFamily: sans }}>
          {action}
        </button>
      </div>
    </article>
  );
}

function AdBand({
  id,
  kicker,
  cards,
  pitch,
}: {
  id: string;
  kicker: string;
  cards: Array<{ id: string; kind: string; title: string; text: string; action: string; href: string; date?: string }>;
  pitch: string;
}) {
  return (
    <section id={id} className="scroll-mt-6 border-t-2 border-black">
      <div
        className="bg-black px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-white"
        style={{ fontFamily: mono, fontWeight: 500 }}
      >
        {kicker}
      </div>
      <div className="grid lg:grid-cols-4">
        {cards.map((card) => (
          <article key={card.id} className="flex flex-col border-b border-black lg:border-r lg:border-b-0">
            <p
              className="flex items-center justify-between bg-[#FFE14A] px-4 py-1.5 text-[10px] uppercase tracking-[0.1em]"
              style={{ fontFamily: mono, fontWeight: 500 }}
            >
              <span>Advertisement</span>
              <span>{card.kind}</span>
            </p>
            <div className="flex flex-1 flex-col px-4 py-4">
              <h3 className="text-[1.6rem] leading-none tracking-[-0.03em]" style={{ fontFamily: sans, fontWeight: 800 }}>
                {card.title}
              </h3>
              {card.date ? (
                <span className="mt-2 inline-block self-start bg-black px-1.5 py-1 text-[10px] uppercase text-white" style={{ fontFamily: mono }}>
                  {card.date}
                </span>
              ) : null}
              <p className="mt-2 text-[14px] leading-snug" style={{ fontFamily: sans }}>
                {card.text}
              </p>
              <a
                href={card.href}
                target="_blank"
                rel="noreferrer"
                className="mt-4 self-start border border-black px-3 py-1.5 text-[14px]"
                style={{ fontFamily: sans }}
              >
                {card.action}
              </a>
            </div>
          </article>
        ))}
        <article className="flex flex-col bg-black text-white">
          <p
            className="flex items-center justify-between px-4 py-1.5 text-[10px] uppercase tracking-[0.1em]"
            style={{ fontFamily: mono, fontWeight: 500 }}
          >
            <span>Advertise here</span>
            <span>Your business</span>
          </p>
          <div className="flex flex-1 flex-col px-4 py-4">
            <h3 className="text-[1.7rem] leading-none tracking-[-0.03em]" style={{ fontFamily: sans, fontWeight: 800 }}>
              Your business here.
            </h3>
            <p className="mt-2 text-[14px] leading-snug" style={{ fontFamily: sans }}>
              {pitch}
            </p>
            <Link
              href="/contact"
              className="mt-4 self-start border border-white px-3 py-1.5 text-[14px]"
              style={{ fontFamily: sans }}
            >
              Advertise with us
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
