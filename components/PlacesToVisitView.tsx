"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import VisitRow from "@/components/VisitRow";
import type { SiteSponsor } from "@/lib/directory-sponsors";
import type { PublicVisit } from "@/lib/public-visits";
import type { ListedVisit } from "@/lib/visits";

const sans =
  "var(--font-bricolage), system-ui, -apple-system, 'Segoe UI', sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";
const serif = "var(--font-newsreader), Georgia, 'Times New Roman', serif";

const tabs = ["All", "History", "Walks", "Family", "Free", "Rainy day"] as const;
type VisitTab = (typeof tabs)[number];

function linkHref(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function toListedVisit(visit: PublicVisit): ListedVisit {
  return {
    id: visit.id,
    title: visit.name,
    text: visit.tagline,
    kind: visit.activity,
    time: visit.time,
    price: visit.cost,
    tags: [],
    placeName: visit.place_name,
    county: visit.county,
    placeId: visit.place_id,
    mapUrl: visit.location,
  };
}

export default function PlacesToVisitView({
  visits,
  main,
  sponsors,
}: {
  visits: PublicVisit[];
  main: SiteSponsor | null;
  sponsors: SiteSponsor[];
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<VisitTab>("All");
  const [location, setLocation] = useState("All locations");
  const [sort, setSort] = useState<"az" | "za">("az");
  const catalogue = useMemo(() => visits.map(toListedVisit), [visits]);
  const locations = useMemo(
    () => Array.from(new Set(catalogue.map((visit) => visit.placeName).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [catalogue],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const next = catalogue.filter((visit) => {
      const matchesTab = tab === "All" || matchesVisitTab(visit, tab);
      const matchesLocation = location === "All locations" || visit.placeName === location;
      const matchesQuery =
        needle.length === 0 ||
        visit.title.toLowerCase().includes(needle) ||
        visit.text.toLowerCase().includes(needle) ||
        visit.kind.toLowerCase().includes(needle) ||
        visit.placeName.toLowerCase().includes(needle) ||
        visit.county.toLowerCase().includes(needle);
      return matchesTab && matchesLocation && matchesQuery;
    });
    next.sort((a, b) => sortKey(a.title).localeCompare(sortKey(b.title), "en"));
    if (sort === "za") next.reverse();
    return next;
  }, [catalogue, query, tab, location, sort]);

  const groups = useMemo(() => {
    const rows: Array<{ letter: string; visits: ListedVisit[] }> = [];
    for (const visit of visible) {
      const letter = letterFor(visit.title);
      const last = rows[rows.length - 1];
      if (!last || last.letter !== letter) rows.push({ letter, visits: [visit] });
      else last.visits.push(visit);
    }
    return rows;
  }, [visible]);

  return (
    <section className="bg-white text-black">
      <div className="flex flex-col gap-6 px-4 py-10 sm:gap-8 sm:px-8 sm:py-20 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:py-24">
        <div className="min-w-0">
          <p
            className="text-[11px] uppercase tracking-[0.16em]"
            style={{ fontFamily: mono, fontWeight: 500 }}
          >
            Places to visit · {catalogue.length} places in {locations.length} locations
          </p>
          <h1
            className="mt-2 max-w-full text-[clamp(2.8rem,14vw,5rem)] leading-[0.84] tracking-[-0.045em] break-words"
            style={{
              fontFamily: sans,
              fontWeight: 800,
              fontVariationSettings: '"opsz" 72, "wdth" 100',
            }}
          >
            Things to do,
            <br />A to Z
          </h1>
        </div>
        <p
          className="max-w-[18rem] text-[1.35rem] leading-snug lg:text-right"
          style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 500 }}
        >
          Filter by type, or pick a village, town or city and see what is worth your time.
        </p>
      </div>

      <div className="flex w-full min-w-0 flex-col border-y-2 border-black lg:min-h-12 lg:flex-row lg:flex-nowrap lg:items-stretch">
        <label className="min-h-12 border-b-2 border-black lg:min-w-0 lg:flex-1 lg:border-b-0">
          <span className="sr-only">Search places, types or locations</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search places, types or locations"
            className="h-12 w-full bg-white px-4 text-[15px] outline-none placeholder:text-neutral-500 lg:h-full"
            style={{ fontFamily: sans, fontWeight: 500 }}
          />
        </label>

        <div className="grid grid-cols-3 border-b-2 border-black lg:flex lg:shrink-0 lg:border-b-0 lg:border-l-2" role="tablist" aria-label="Visit type">
          {tabs.map((item) => {
            const active = tab === item;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item)}
                className={`min-h-12 min-w-0 border-r-2 border-b-2 border-black px-1 text-[13px] leading-tight last:border-r-0 [&:nth-child(3n)]:border-r-0 [&:nth-child(n+4)]:border-b-0 sm:px-4 sm:text-[15px] lg:border-b-0 lg:px-4 lg:last:border-r-2 lg:[&:nth-child(3n)]:border-r-2 ${
                  active ? "bg-black text-white" : "bg-white hover:bg-neutral-100"
                }`}
                style={{ fontFamily: sans, fontWeight: 500 }}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:contents">
          <label className="relative flex min-h-12 min-w-0 items-center border-b-2 border-black sm:border-r-2 sm:border-b-0 lg:border-r-2">
            <span className="sr-only">Location</span>
            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="h-full w-full min-w-0 max-w-full cursor-pointer appearance-none bg-white py-3 pr-8 pl-3 text-[14px] outline-none sm:pr-9 sm:pl-4 sm:text-[15px]"
              style={{ fontFamily: sans, fontWeight: 500 }}
            >
              <option>All locations</option>
              {locations.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
            <Chevron />
          </label>

          <label className="relative flex min-h-12 min-w-0 items-center">
            <span className="sr-only">Sort</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value === "za" ? "za" : "az")}
              className="h-full w-full min-w-0 max-w-full cursor-pointer appearance-none bg-white py-3 pr-8 pl-3 text-[14px] outline-none sm:pr-9 sm:pl-4 sm:text-[15px]"
              style={{ fontFamily: sans, fontWeight: 500 }}
            >
              <option value="az">Sort: A to Z</option>
              <option value="za">Sort: Z to A</option>
            </select>
            <Chevron />
          </label>
        </div>
      </div>

      {main ? (
        <article className="flex flex-col gap-4 border-b-2 border-black px-4 py-3 sm:flex-row sm:items-center sm:gap-5 sm:px-5">
          <div
            className="flex w-full shrink-0 flex-col justify-center bg-[#FFE14A] px-3 py-2 text-[10px] uppercase leading-tight tracking-[0.14em] sm:w-36"
            style={{ fontFamily: mono, fontWeight: 500 }}
          >
            <span>Advertisement</span>
            <span>{main.provider}</span>
          </div>
          <h2
            className="text-[1.35rem] leading-none tracking-[-0.03em] break-words sm:text-[1.65rem]"
            style={{ fontFamily: sans, fontWeight: 800 }}
          >
            {main.title}
          </h2>
          {main.date ? (
            <span
              className="w-fit bg-black px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-white"
              style={{ fontFamily: mono, fontWeight: 500 }}
            >
              {main.date}
            </span>
          ) : null}
          <p className="min-w-0 flex-1 text-[15px] leading-snug" style={{ fontFamily: sans }}>
            {main.tagline}
          </p>
          <a
            href={linkHref(main.link)}
            target="_blank"
            rel="noreferrer"
            className="w-fit shrink-0 border-2 border-black bg-white px-3 py-2 text-[14px] hover:bg-neutral-100"
            style={{ fontFamily: sans, fontWeight: 500 }}
          >
            {main.action}
          </a>
        </article>
      ) : null}

      <div className="grid min-w-0 grid-cols-1 border-2 border-black lg:h-[calc(100vh-2rem)] lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="flex min-w-0 flex-col border-b-2 border-black lg:min-h-0 lg:border-r-2 lg:border-b-0">
          <div className="flex shrink-0 items-end gap-3 border-b-2 border-black px-5 py-4">
            <span
              className="text-[3.25rem] leading-none tracking-[-0.04em]"
              style={{ fontFamily: sans, fontWeight: 800 }}
            >
              {visible.length}
            </span>
            <span
              className="mb-1.5 text-[11px] uppercase tracking-[0.14em]"
              style={{ fontFamily: mono, fontWeight: 500 }}
            >
              Places match
            </span>
          </div>

          <div className="min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain">
          <div
            className="sticky top-0 z-10 hidden grid-cols-[3.5rem_minmax(0,1.7fr)_12rem_9rem_8rem_6.5rem] border-b-2 border-black bg-[#f3f3f3] text-[10px] uppercase tracking-[0.14em] text-neutral-500 lg:grid"
            style={{ fontFamily: mono, fontWeight: 500 }}
          >
            <div className="flex items-center justify-center border-r-2 border-black py-2">#</div>
            <div className="px-5 py-2">Place to visit</div>
            <div className="px-5 py-2">Location</div>
            <div className="px-5 py-2">Type</div>
            <div className="px-5 py-2">Time</div>
            <div className="px-5 py-2">Cost</div>
          </div>

          {groups.length === 0 ? (
            <p className="px-5 py-10 text-[15px]" style={{ fontFamily: sans }}>
              No places match.
            </p>
          ) : (
            groups.map((group) =>
              group.visits.map((visit, index) => (
                <VisitRow
                  key={visit.id ?? `${visit.placeName}-${visit.title}`}
                  visit={visit}
                  letter={index === 0 ? group.letter : ""}
                />
              )),
            )
          )}
          </div>
        </div>

        <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain p-4">
          {sponsors.map((sponsor) => (
            <article key={sponsor.id} className="border-2 border-black">
              <div
                className="flex items-center justify-between gap-3 bg-[#FFE14A] px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]"
                style={{ fontFamily: mono, fontWeight: 500 }}
              >
                <span>Advertisement</span>
                <span className="text-right">{sponsor.provider}</span>
              </div>
              <div className="px-3 py-3">
                <h3
                  className="text-[1.7rem] leading-[0.95] tracking-[-0.03em] break-words"
                  style={{ fontFamily: sans, fontWeight: 800 }}
                >
                  {sponsor.title}
                </h3>
                {sponsor.date ? (
                  <span
                    className="mt-2 inline-block bg-black px-1.5 py-1 text-[10px] uppercase tracking-[0.08em] text-white"
                    style={{ fontFamily: mono, fontWeight: 500 }}
                  >
                    {sponsor.date}
                  </span>
                ) : null}
                <p className="mt-2 text-[14px] leading-snug" style={{ fontFamily: sans }}>
                  {sponsor.tagline}
                </p>
                <a
                  href={linkHref(sponsor.link)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block border-2 border-black px-3 py-1.5 text-[14px] hover:bg-neutral-100"
                  style={{ fontFamily: sans, fontWeight: 500 }}
                >
                  {sponsor.action}
                </a>
              </div>
            </article>
          ))}
          <article className="border-2 border-black bg-black px-3 py-3 text-white">
            <div
              className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em]"
              style={{ fontFamily: mono, fontWeight: 500 }}
            >
              <span>Advertise here</span>
              <span>Your business</span>
            </div>
            <h3
              className="mt-3 text-[1.85rem] leading-[0.95] tracking-[-0.03em]"
              style={{ fontFamily: sans, fontWeight: 800 }}
            >
              Your business here.
            </h3>
            <p className="mt-3 text-[14px] leading-snug" style={{ fontFamily: sans }}>
              Walks, museums, boat trips and workshops: reach people planning the day.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-block border-2 border-white px-3 py-1.5 text-[14px] text-white hover:bg-white hover:text-black"
              style={{ fontFamily: sans, fontWeight: 500 }}
            >
              Advertise with us
            </Link>
          </article>
        </aside>
      </div>
    </section>
  );
}

function matchesVisitTab(visit: ListedVisit, tab: VisitTab) {
  const kind = visit.kind.toLowerCase();
  if (tab === "Free") return /free/i.test(visit.price) || visit.tags.includes("Free");
  if (tab === "Walks") return visit.tags.includes("Walks") || kind.includes("walk");
  if (tab === "History") return visit.tags.includes("History") || kind.includes("history");
  if (tab === "Family") return visit.tags.includes("Family") || kind.includes("family");
  if (tab === "Rainy day") return visit.tags.includes("Rainy day") || kind.includes("rain");
  return visit.tags.includes(tab);
}

function sortKey(title: string) {
  const stripped = title.replace(/^the\s+/i, "");
  const letter = letterFor(title);
  return `${letter === "#" ? "0" : letter} ${stripped}`;
}

function letterFor(title: string) {
  const stripped = title.replace(/^the\s+/i, "");
  const char = stripped.charAt(0);
  return /\d/.test(char) ? "#" : char.toUpperCase();
}

function Chevron() {
  return (
    <svg viewBox="0 0 12 8" aria-hidden="true" className="pointer-events-none absolute right-3 h-2 w-3">
      <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
