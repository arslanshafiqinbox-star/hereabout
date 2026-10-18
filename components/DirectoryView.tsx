"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DirectorySponsor } from "@/lib/directory-sponsors";
import type { PlaceType } from "@/lib/places";
import type { PublicPlace, PublicPlaceType } from "@/lib/public-places";

const sans =
  "var(--font-bricolage), system-ui, -apple-system, 'Segoe UI', sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";
const serif = "var(--font-newsreader), Georgia, 'Times New Roman', serif";

const typeTabs: Array<"All" | PlaceType> = ["All", "Village", "Town", "City"];

const typeColor: Record<string, string> = {
  Village: "#2F8F4E",
  Town: "#E2B100",
  City: "#3A6FD8",
};

function linkHref(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

const typePages: Record<PublicPlaceType, { plural: string; kicker: string }> = {
  Village: { plural: "Villages", kicker: "Villages" },
  Town: { plural: "Towns", kicker: "Towns" },
  City: { plural: "Cities", kicker: "Cities" },
};

export default function DirectoryView({
  places,
  main,
  sponsors,
  focus,
}: {
  places: PublicPlace[];
  main: DirectorySponsor | null;
  sponsors: DirectorySponsor[];
  focus?: PublicPlaceType;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"All" | PlaceType>(focus ?? "All");
  const page = focus ? typePages[focus] : null;
  const [county, setCounty] = useState("All counties");
  const [sort, setSort] = useState<"az" | "za">("az");
  const counties = useMemo(
    () => Array.from(new Set(places.map((place) => place.county).filter(Boolean))).sort(),
    [places],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const next = places.filter((place) => {
      const matchesType = type === "All" || place.type === type;
      const matchesCounty = county === "All counties" || place.county === county;
      const matchesQuery =
        needle.length === 0 ||
        place.name.toLowerCase().includes(needle) ||
        place.county.toLowerCase().includes(needle) ||
        place.region.toLowerCase().includes(needle);
      return matchesType && matchesCounty && matchesQuery;
    });

    next.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "za") next.reverse();
    return next;
  }, [places, query, type, county, sort]);

  const groups = useMemo(() => {
    const rows: Array<{ letter: string; places: PublicPlace[] }> = [];
    for (const place of visible) {
      const letter = place.name[0]?.toUpperCase() ?? "";
      const last = rows[rows.length - 1];
      if (!last || last.letter !== letter) {
        rows.push({ letter, places: [place] });
      } else {
        last.places.push(place);
      }
    }
    return rows;
  }, [visible]);

  return (
    <section className="min-w-0 max-w-full bg-white text-black">
      <div className="flex flex-col gap-6 px-4 py-10 sm:gap-8 sm:px-8 sm:py-16 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:py-24">
        <div className="min-w-0">
          <p
            className="text-[11px] uppercase tracking-[0.16em]"
            style={{ fontFamily: mono, fontWeight: 500 }}
          >
            Directory · {places.length} places
          </p>
          <h1
            className="mt-2 max-w-full text-[2.7rem] leading-[0.84] tracking-[-0.045em] sm:max-w-[12ch] sm:text-[4rem] lg:text-[5rem]"
            style={{
              fontFamily: sans,
              fontWeight: 800,
              fontVariationSettings: '"opsz" 72, "wdth" 100',
            }}
          >
            Everywhere,
            <br />
            alphabetically
          </h1>
        </div>
        <p
          className="max-w-[16rem] text-[1.2rem] leading-snug lg:text-right"
          style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400 }}
        >
          Filter by type, region or county, or start typing and see what turns up.
        </p>
      </div>

      <div className="flex w-full min-w-0 flex-col border-y-2 border-black lg:min-h-12 lg:flex-row lg:items-stretch">
        <label className="min-h-12 border-b-2 border-black lg:min-w-0 lg:flex-1 lg:border-b-0">
          <span className="sr-only">Search by name, county or region</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, county or region"
            className="h-12 w-full bg-white px-4 text-[15px] outline-none placeholder:text-neutral-500 lg:h-full"
            style={{ fontFamily: sans, fontWeight: 500 }}
          />
        </label>

        <div className="grid grid-cols-4 border-b-2 border-black lg:flex lg:shrink-0 lg:border-b-0 lg:border-l-2" role="tablist" aria-label="Place type">
          {typeTabs.map((tab) => {
            const active = type === tab;
            const label = tab === "Village" ? "Villages" : tab === "Town" ? "Towns" : tab === "City" ? "Cities" : "All";
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setType(tab)}
                className={`min-h-12 min-w-0 border-r-2 border-black px-1 text-[13px] last:border-r-0 sm:px-5 sm:text-[15px] lg:last:border-r-2 ${
                  active ? "bg-black text-white" : "bg-white hover:bg-neutral-100"
                }`}
                style={{ fontFamily: sans, fontWeight: 500 }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 lg:contents">
          <label className="relative flex min-h-12 min-w-0 items-center border-r-2 border-black">
            <span className="sr-only">County</span>
            <select
              value={county}
              onChange={(event) => setCounty(event.target.value)}
              className="h-full w-full min-w-0 max-w-full cursor-pointer appearance-none bg-white py-3 pr-8 pl-3 text-[14px] outline-none sm:pr-9 sm:pl-4 sm:text-[15px]"
              style={{ fontFamily: sans, fontWeight: 500 }}
            >
              <option>All counties</option>
              {counties.map((name) => (
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
        <article className="flex shrink-0 flex-col gap-4 border-b border-black px-4 py-3 sm:flex-row sm:items-center sm:gap-5 sm:px-5">
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
            className="w-fit shrink-0 border border-black bg-white px-3 py-2 text-[14px] hover:bg-neutral-100"
            style={{ fontFamily: sans, fontWeight: 500 }}
          >
            {main.action}
          </a>
        </article>
      ) : null}

      <div className="grid min-w-0 grid-cols-1 border-2 border-black lg:h-[calc(100vh-2rem)] lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 border-b-2 border-black lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:border-r-2 lg:border-b-0">
          <div className="flex items-end gap-3 border-b-2 border-black bg-white px-4 py-4 sm:px-5 lg:sticky lg:top-0 lg:z-10">
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

          <div>
              <div
                className="hidden grid-cols-[3.5rem_minmax(0,2.6fr)_13rem_9rem_7.5rem] border-b-2 border-black bg-[#f3f3f3] text-[10px] uppercase tracking-[0.14em] text-neutral-500 lg:sticky lg:top-[4.75rem] lg:z-10 lg:grid"
                style={{ fontFamily: mono, fontWeight: 500 }}
              >
                <div className="border-r-2 border-black" />
                <div className="px-3 py-2">Place</div>
                <div className="px-3 py-2">County</div>
                <div className="px-3 py-2">Type</div>
                <div className="px-3 py-2 leading-tight">
                  Review
                  <br />
                  score
                </div>
              </div>

              {groups.length === 0 ? (
                <p className="px-5 py-10 text-[15px]" style={{ fontFamily: sans }}>
                  No places match.
                </p>
              ) : (
                groups.map((group) =>
                  group.places.map((place, index) => (
                    <div
                      key={place.id}
                      className="grid grid-cols-[2.5rem_minmax(0,1fr)] border-b-2 border-black lg:grid-cols-[3.5rem_minmax(0,2.6fr)_13rem_9rem_7.5rem]"
                    >
                      <div
                        className="flex items-center justify-center border-r-2 border-black text-[1.65rem] leading-none"
                        style={{ fontFamily: sans, fontWeight: 800 }}
                      >
                        {index === 0 ? group.letter : ""}
                      </div>
                      <div className="min-w-0 px-3 py-4 sm:px-5 sm:py-5">
                        <div className="flex items-start justify-between gap-3">
                          <p
                            className="text-[1.2rem] leading-none tracking-[-0.02em] break-words"
                            style={{ fontFamily: sans, fontWeight: 700 }}
                          >
                            <Link href={`/place/${place.id}`} className="hover:underline">
                              {place.name}
                            </Link>
                          </p>
                          <span
                            className="shrink-0 border border-black px-2 py-0.5 text-[15px] leading-none lg:hidden"
                            style={{ fontFamily: sans, fontWeight: 600 }}
                          >
                            {place.score.toFixed(1)}
                          </span>
                        </div>
                        <p
                          className="mt-1 text-[14px] leading-snug text-neutral-800"
                          style={{ fontFamily: serif, fontStyle: "italic" }}
                        >
                          {place.summary}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 lg:hidden">
                          <span className="flex items-center gap-2 text-[14px]" style={{ fontFamily: sans }}>
                            <span
                              className="h-2.5 w-2.5 shrink-0"
                              style={{ backgroundColor: typeColor[place.type] ?? "#111" }}
                              aria-hidden="true"
                            />
                            {place.type}
                          </span>
                          <span className="text-[14px]" style={{ fontFamily: sans, fontWeight: 600 }}>
                            {place.county}
                          </span>
                          <span
                            className="text-[10px] uppercase tracking-[0.12em] text-neutral-500"
                            style={{ fontFamily: mono, fontWeight: 500 }}
                          >
                            {place.region}
                          </span>
                        </div>
                      </div>
                      <div className="hidden flex-col justify-center px-5 py-5 lg:flex">
                        <p className="text-[15px]" style={{ fontFamily: sans, fontWeight: 600 }}>
                          {place.county}
                        </p>
                        <p
                          className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-neutral-500"
                          style={{ fontFamily: mono, fontWeight: 500 }}
                        >
                          {place.region}
                        </p>
                      </div>
                      <div className="hidden items-center gap-2 px-5 py-5 lg:flex">
                        <span
                          className="h-2.5 w-2.5 shrink-0"
                          style={{ backgroundColor: typeColor[place.type] ?? "#111" }}
                          aria-hidden="true"
                        />
                        <span className="text-[15px]" style={{ fontFamily: sans }}>
                          {place.type}
                        </span>
                      </div>
                      <div className="hidden items-center px-5 py-5 lg:flex">
                        <span
                          className="border border-black px-2 py-0.5 text-[15px] leading-none"
                          style={{ fontFamily: sans, fontWeight: 600 }}
                        >
                          {place.score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}
          </div>
        </div>

        <aside className="flex min-w-0 flex-col gap-4 p-4 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
          {sponsors.map((sponsor) => (
            <AdCard
              key={sponsor.id}
              category={sponsor.provider}
              title={sponsor.title}
              date={sponsor.date}
              body={sponsor.tagline}
              action={sponsor.action}
              href={linkHref(sponsor.link)}
            />
          ))}
          <article className="border border-black bg-black px-3 py-3 text-white">
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
              Restaurants, cafés, hotels and B&Bs: reach people deciding where to go next.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-block border border-white px-3 py-1.5 text-[14px] text-white hover:bg-white hover:text-black"
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

function AdCard({
  category,
  title,
  date,
  body,
  action,
  href,
}: {
  category: string;
  title: string;
  date?: string;
  body: string;
  action: string;
  href: string;
}) {
  return (
    <article className="border border-black">
      <div
        className="flex items-center justify-between bg-[#FFE14A] px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]"
        style={{ fontFamily: mono, fontWeight: 500 }}
      >
        <span>Advertisement</span>
        <span>{category}</span>
      </div>
      <div className="px-3 py-3">
        <h3
          className="text-[1.7rem] leading-[0.95] tracking-[-0.03em] break-words"
          style={{ fontFamily: sans, fontWeight: 800 }}
        >
          {title}
        </h3>
        {date ? (
          <span
            className="mt-2 inline-block bg-black px-1.5 py-1 text-[10px] uppercase tracking-[0.08em] text-white"
            style={{ fontFamily: mono, fontWeight: 500 }}
          >
            {date}
          </span>
        ) : null}
        <p className="mt-2 text-[14px] leading-snug" style={{ fontFamily: sans }}>
          {body}
        </p>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block border border-black px-3 py-1.5 text-[14px] hover:bg-neutral-100"
          style={{ fontFamily: sans, fontWeight: 500 }}
        >
          {action}
        </a>
      </div>
    </article>
  );
}

function Chevron() {
  return (
    <svg
      viewBox="0 0 12 8"
      aria-hidden="true"
      className="pointer-events-none absolute right-3 h-2 w-3"
    >
      <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
