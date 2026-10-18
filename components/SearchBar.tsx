"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

const sans = "var(--font-bricolage), system-ui, -apple-system, 'Segoe UI', sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

type SearchPlace = { id: string; name: string; type: string; county: string };
type SearchVisit = { id: string; name: string; activity: string; placeId: string; placeName: string };
type Catalogue = { places: SearchPlace[]; visits: SearchVisit[] };
type Hit =
  | { kind: "place"; id: string; name: string; meta: string; href: string }
  | { kind: "visit"; id: string; name: string; meta: string; href: string };

export default function SearchBar() {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [missed, setMissed] = useState(false);

  useEffect(() => {
    let live = true;
    fetch("/api/search")
      .then((response) => response.json())
      .then((body: Catalogue) => {
        if (live) setCatalogue({ places: body.places ?? [], visits: body.visits ?? [] });
      })
      .catch(() => {
        if (live) setCatalogue({ places: [], visits: [] });
      });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, []);

  const needle = query.trim().toLowerCase();
  const places = useMemo(() => matchPlaces(catalogue?.places ?? [], needle).slice(0, 6), [catalogue, needle]);
  const visits = useMemo(() => matchVisits(catalogue?.visits ?? [], needle).slice(0, 6), [catalogue, needle]);
  const hits = useMemo<Hit[]>(() => [...places, ...visits], [places, visits]);
  const showPanel = open && needle.length > 0;

  function go(href: string) {
    setOpen(false);
    setMissed(false);
    router.push(href);
  }

  function search(event: FormEvent) {
    event.preventDefault();
    const hit = hits[active] ?? hits[0];
    if (!hit) {
      setMissed(true);
      setOpen(false);
      return;
    }
    go(hit.href);
  }

  function onKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!showPanel || hits.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (index + 1) % hits.length);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index - 1 + hits.length) % hits.length);
    }
  }

  const counts = catalogue
    ? {
        villages: catalogue.places.filter((place) => place.type === "Village").length,
        towns: catalogue.places.filter((place) => place.type === "Town").length,
        cities: catalogue.places.filter((place) => place.type === "City").length,
        visits: catalogue.visits.length,
      }
    : null;

  return (
    <section className="min-w-0 px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <p className="text-[11px] uppercase leading-snug tracking-[0.14em]" style={{ fontFamily: mono, fontWeight: 500 }}>
        Look up a village, town, city or place to visit
      </p>
      <div ref={box} className="relative mt-3 min-w-0">
        <form onSubmit={search} className="flex w-full min-w-0 border-2 border-black shadow-[4px_4px_0_0_#000] sm:shadow-[6px_6px_0_0_#000]">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Search</span>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
                setActive(0);
                setMissed(false);
              }}
              onFocus={() => {
                if (query.trim()) setOpen(true);
              }}
              onKeyDown={onKey}
              placeholder="Rye, Durham, Whitby Abbey..."
              className="h-14 w-full min-w-0 bg-white px-3 text-[clamp(1.25rem,5.5vw,2.8rem)] leading-none outline-none placeholder:text-[clamp(0.95rem,3.8vw,1.6rem)] placeholder:font-medium placeholder:text-neutral-400 sm:h-20 sm:px-5"
              style={{ fontFamily: sans, fontWeight: 800 }}
              role="combobox"
              aria-expanded={showPanel}
              aria-controls="search-results"
              aria-autocomplete="list"
            />
          </label>
          <button type="submit" className="shrink-0 bg-black px-4 text-[1.05rem] text-white sm:px-8 sm:text-[1.35rem]" style={{ fontFamily: sans, fontWeight: 700 }}>
            Go
          </button>
        </form>

        {showPanel ? (
          <div id="search-results" role="listbox" className="mt-2 max-w-full border-2 border-black bg-white sm:mt-3">
            <Group label="Villages, towns and cities" />
            {places.length === 0 ? (
              <p className="border-b-2 border-black px-4 py-3 text-[15px]" style={{ fontFamily: sans }}>
                No villages, towns or cities match.
              </p>
            ) : (
              places.map((place, index) => (
                <ResultRow
                  key={place.id}
                  name={place.name}
                  meta={place.meta}
                  active={active === index}
                  onHover={() => setActive(index)}
                  onChoose={() => go(place.href)}
                />
              ))
            )}
            <Group label="Places to visit" />
            {visits.length === 0 ? (
              <p className="border-b-2 border-black px-4 py-3 text-[15px]" style={{ fontFamily: sans }}>
                No places to visit match.
              </p>
            ) : (
              visits.map((visit, index) => (
                <ResultRow
                  key={visit.id}
                  name={visit.name}
                  meta={visit.meta}
                  active={active === places.length + index}
                  onHover={() => setActive(places.length + index)}
                  onChoose={() => go(visit.href)}
                />
              ))
            )}
            <Link
              href="/places"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-[12px] uppercase tracking-[0.08em] underline"
              style={{ fontFamily: mono, fontWeight: 500 }}
            >
              See all {catalogue?.visits.length ?? 0} places to visit
            </Link>
          </div>
        ) : null}
      </div>
      {missed ? (
        <p className="mt-3 text-[14px]" style={{ fontFamily: sans }}>
          Nothing matches that yet.
        </p>
      ) : null}
      <p className="mt-4 text-[15px]" style={{ fontFamily: sans, fontWeight: 700 }}>
        Or browse{" "}
        <Browse href="/villages" label="villages" count={counts?.villages} />{" "}
        <Browse href="/towns" label="towns" count={counts?.towns} />{" "}
        <Browse href="/cities" label="cities" count={counts?.cities} />{" "}
        <Browse href="/places" label="places to visit" count={counts?.visits} />{" "}
        <Browse href="/directory" label="all places, A to Z" />
      </p>
    </section>
  );
}

function Group({ label }: { label: string }) {
  return (
    <p
      className="border-b-2 border-black bg-[#f3f3f3] px-4 py-1.5 text-[11px] uppercase tracking-[0.12em] text-neutral-700"
      style={{ fontFamily: mono, fontWeight: 500 }}
    >
      {label}
    </p>
  );
}

function ResultRow({
  name,
  meta,
  active,
  onHover,
  onChoose,
}: {
  name: string;
  meta: string;
  active: boolean;
  onHover: () => void;
  onChoose: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onMouseEnter={onHover}
      onClick={onChoose}
      className={`flex w-full min-w-0 flex-col items-start gap-1 border-b-2 border-black px-3 py-3 text-left sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 sm:px-4 ${
        active ? "bg-[#FFD200]" : "bg-white"
      }`}
    >
      <span className="min-w-0 text-[1.05rem] leading-tight tracking-[-0.02em] break-words sm:text-[1.15rem]" style={{ fontFamily: sans, fontWeight: 800 }}>
        {name}
      </span>
      <span className="max-w-full text-left text-[12px] leading-snug text-neutral-700 sm:shrink-0 sm:text-right sm:text-[13px]" style={{ fontFamily: sans }}>
        {meta}
      </span>
    </button>
  );
}

function Browse({ href, label, count }: { href: string; label: string; count?: number }) {
  return (
    <Link href={href} className="underline" style={{ fontFamily: sans, fontWeight: 700 }}>
      {label}
      {count != null ? ` (${count})` : ""}
    </Link>
  );
}

function matchPlaces(places: SearchPlace[], needle: string): Hit[] {
  if (!needle) return [];
  return rank(
    places.filter((place) =>
      [place.name, place.county, place.type].some((value) => value.toLowerCase().includes(needle)),
    ),
    needle,
    (place) => place.name,
  ).map((place) => ({
    kind: "place" as const,
    id: place.id,
    name: place.name,
    meta: [place.type, place.county].filter(Boolean).join(", "),
    href: `/place/${place.id}`,
  }));
}

function matchVisits(visits: SearchVisit[], needle: string): Hit[] {
  if (!needle) return [];
  return rank(
    visits.filter((visit) =>
      [visit.name, visit.activity, visit.placeName].some((value) => value.toLowerCase().includes(needle)),
    ),
    needle,
    (visit) => visit.name,
  ).map((visit) => ({
    kind: "visit" as const,
    id: visit.id,
    name: visit.name,
    meta: visit.activity && visit.placeName ? `${visit.activity} in ${visit.placeName}` : visit.placeName || visit.activity,
    href: visit.placeId ? `/place/${visit.placeId}` : "/places",
  }));
}

function rank<T>(rows: T[], needle: string, name: (row: T) => string) {
  return [...rows].sort((a, b) => score(name(a), needle) - score(name(b), needle) || name(a).localeCompare(name(b)));
}

function score(value: string, needle: string) {
  const text = value.toLowerCase();
  if (text.startsWith(needle)) return 0;
  if (text.includes(` ${needle}`)) return 1;
  return 2;
}
