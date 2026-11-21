"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlaceTabs } from "@/components/admin/PlaceTabs";

const sans = "var(--font-bricolage), system-ui, sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

function mapHref(location: string) {
  const value = location.trim();
  if (/^https?:\/\//i.test(value)) return value;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
}

export type VisitRow = {
  id: string;
  name: string;
  location: string;
  tagline: string;
  place_id: string;
  county: string;
  activity: string;
  time: string;
  cost: string;
  article: string;
  bestTime: string;
  goIf: string[];
  skipIf: string[];
  video: string;
  closestStation: string;
  closestStationLocation: string;
};

export function VisitManager({
  placeName,
  placeId,
  rows,
}: {
  placeName: string;
  placeId: string;
  rows: VisitRow[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function remove(id: string) {
    setMessage("");
    setPending(true);
    const response = await fetch(`/api/admin/visit?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    setPending(false);
    if (!response.ok) {
      setMessage(body?.message || "Could not save that visit.");
      return;
    }
    router.refresh();
  }

  return (
    <main className="px-5 py-10 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: mono }}>
        <Link href="/admin/place" className="underline">
          Place
        </Link>
        {" / "}
        {placeName}
      </p>
      <PlaceTabs placeId={placeId} active="visits" />
      <div className="mt-6 flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: mono }}>
            {rows.length} {rows.length === 1 ? "visit" : "visits"}
          </p>
          <h1 className="mt-2 text-5xl leading-none tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 560 }}>
            Visit a place
          </h1>
        </div>
        <Link
          href={`/admin/place/${placeId}/visits/new`}
          className="border-2 border-black bg-[#FFD200] px-5 py-3 text-[11px] uppercase tracking-[0.14em]"
          style={{ fontFamily: mono }}
        >
          Add
        </Link>
      </div>
      {message ? (
        <p className="mt-4 text-sm" style={{ fontFamily: sans }}>
          {message}
        </p>
      ) : null}

      <div className="mt-8 overflow-x-auto border-2 border-black">
        <table className="w-full min-w-[64rem] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-black bg-neutral-50">
              {["Name", "Location", "County", "Activity", "Time", "Cost", ""].map((heading) => (
                <th
                  key={heading || "actions"}
                  className="border-r-2 border-black px-4 py-3 text-[11px] uppercase tracking-[0.14em] last:border-r-0"
                  style={{ fontFamily: mono, fontWeight: 500 }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-sm" style={{ fontFamily: sans }}>
                  No visits yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b-2 border-black last:border-b-0">
                  <td className="border-r-2 border-black px-4 py-3">
                    <Link href={`/admin/place/${placeId}/visits/${row.id}`} className="underline" style={{ fontFamily: sans, fontWeight: 600 }}>
                      {row.name}
                    </Link>
                    <p className="mt-1 text-sm text-neutral-600" style={{ fontFamily: sans }}>
                      {row.tagline}
                    </p>
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                    <a href={mapHref(row.location)} target="_blank" rel="noreferrer" className="underline">
                      Map <span aria-hidden="true">↗</span>
                    </a>
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                    {row.county}
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                    {row.activity}
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                    {row.time}
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                    {row.cost}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link
                      href={`/admin/place/${placeId}/visits/${row.id}`}
                      className="text-[11px] uppercase tracking-[0.14em] underline"
                      style={{ fontFamily: mono }}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(row.id)}
                      className="ml-4 text-[11px] uppercase tracking-[0.14em] underline"
                      style={{ fontFamily: mono }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </main>
  );
}
