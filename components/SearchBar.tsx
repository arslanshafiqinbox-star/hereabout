"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { placeSlug, places } from "@/lib/places";
import { allVisits } from "@/lib/visits";

const sans =
  "var(--font-bricolage), system-ui, -apple-system, 'Segoe UI', sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

const browse = [
  { href: "/villages", label: "villages", count: places.filter((place) => place.type === "Village").length },
  { href: "/towns", label: "towns", count: places.filter((place) => place.type === "Town").length },
  { href: "/cities", label: "cities", count: places.filter((place) => place.type === "City").length },
  { href: "/places", label: "places to visit", count: allVisits().length },
  { href: "/directory", label: "all places, A to Z", count: null },
];

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [missed, setMissed] = useState(false);

  function search(event: FormEvent) {
    event.preventDefault();
    const target = findTarget(query);
    if (!target) {
      setMissed(true);
      return;
    }
    setMissed(false);
    router.push(target);
  }

  return (
    <section className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <p
        className="text-[11px] uppercase tracking-[0.14em]"
        style={{ fontFamily: mono, fontWeight: 500 }}
      >
        Look up a village, town, city or place to visit
      </p>
      <form
        onSubmit={search}
        className="mt-3 flex w-full border-2 border-black shadow-[6px_6px_0_0_#000]"
      >
        <label className="min-w-0 flex-1">
          <span className="sr-only">Search</span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setMissed(false);
            }}
            placeholder="Rye, Durham, Whitby Abbey..."
            className="h-18 w-full bg-white px-5 text-[2rem] outline-none placeholder:text-neutral-400 placeholder:text-[2rem] placeholder:font-bold"
            style={{ fontFamily: sans, fontWeight: 500 }}
          />
        </label>
        <button
          type="submit"
            className="shrink-0 bg-black px-8 text-[1.35rem] text-white"
          style={{ fontFamily: sans, fontWeight: 700 }}
        >
          Go
        </button>
      </form>
      {missed ? (
        <p className="mt-3 text-[14px]" style={{ fontFamily: sans }}>
          Nothing matches that yet.
        </p>
      ) : null}
      <p className="mt-4 font-bold text-[15px]" style={{ fontFamily: sans }}>
        Or browse{" "}
        {browse.map((item, index) => (
          <span key={item.href}>
            {index > 0 ? " " : null}
            <Link href={item.href} className="underline">
              {item.label}
              {item.count != null ? ` (${item.count})` : ""}
            </Link>
          </span>
        ))}
      </p>
    </section>
  );
}

function findTarget(query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return null;

  const place =
    places.find((item) => item.name.toLowerCase() === needle) ??
    places.find((item) => item.name.toLowerCase().startsWith(needle)) ??
    places.find(
      (item) =>
        item.name.toLowerCase().includes(needle) || item.county.toLowerCase().includes(needle),
    );
  if (place) return `/place/${placeSlug(place.name)}`;

  const visit = allVisits().find(
    (item) =>
      item.title.toLowerCase().includes(needle) || item.placeName.toLowerCase().includes(needle),
  );
  if (!visit) return null;
  return `/place/${placeSlug(visit.placeName)}/visit/${placeSlug(visit.title)}`;
}
