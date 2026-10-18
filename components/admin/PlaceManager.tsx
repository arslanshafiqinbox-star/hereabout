"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const sans = "var(--font-bricolage), system-ui, sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

export type PlaceOption = { id: string; name: string };

export type PlaceScore = {
  character: number;
  food_drink: number;
  walks: number;
  getting_together: number;
  value: number;
};

export type PlaceRow = {
  id: string;
  name: string;
  tagline: string;
  type_id: string;
  county_id: string;
  region_id: string;
  type_name: string;
  county_name: string;
  region_name: string;
  local_authority: string;
  closest_station: string;
  closest_station_location: string;
  score: PlaceScore;
  our_take: string;
  comment_to_be_displayed: string;
  primary_des: string;
  secondary_des: string;
  featured: boolean;
};

const scoreFields: { key: keyof PlaceScore; label: string }[] = [
  { key: "character", label: "Character" },
  { key: "food_drink", label: "Food & drink" },
  { key: "walks", label: "Walks" },
  { key: "getting_together", label: "Getting together" },
  { key: "value", label: "Value" },
];

function average(score: PlaceScore) {
  const total = scoreFields.reduce((sum, field) => sum + score[field.key], 0);
  return (total / scoreFields.length).toFixed(1);
}

function plain(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}

export function PlaceManager({ rows }: { rows: PlaceRow[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [featuring, setFeaturing] = useState("");

  async function remove(id: string) {
    setMessage("");
    setPending(true);
    const response = await fetch(`/api/admin/place?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    setPending(false);
    if (!response.ok) {
      setMessage(body?.message || "Could not delete that place.");
      return;
    }
    router.refresh();
  }

  async function setFeatured(id: string, featured: boolean) {
    setMessage("");
    setFeaturing(id);
    const response = await fetch("/api/admin/place", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, featured }),
    });
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    setFeaturing("");
    if (!response.ok) {
      setMessage(body?.message || "Could not update that place.");
      return;
    }
    router.refresh();
  }

  return (
    <main className="px-5 py-10 sm:px-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: mono }}>
            {rows.length} {rows.length === 1 ? "place" : "places"}
          </p>
          <h1 className="mt-2 text-5xl leading-none tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 560 }}>
            Place
          </h1>
        </div>
        <Link
          href="/admin/place/new"
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
              {["Name", "Type", "County", "Region", "Score", "Featured", ""].map((heading) => (
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
                  No places yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/admin/place/${row.id}/visits`)}
                  className="cursor-pointer border-b-2 border-black last:border-b-0 hover:bg-neutral-50"
                >
                  <td className="border-r-2 border-black px-4 py-3">
                    <p style={{ fontFamily: sans, fontWeight: 600 }}>{row.name}</p>
                    <p className="mt-1 text-sm text-neutral-600" style={{ fontFamily: sans }}>
                      {plain(row.tagline)}
                    </p>
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                    {row.type_name}
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                    {row.county_name}
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                    {row.region_name}
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: mono }}>
                    {average(row.score)}
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      disabled={featuring === row.id}
                      onClick={() => setFeatured(row.id, !row.featured)}
                      className={`border-2 border-black px-3 py-2 text-[11px] uppercase tracking-[0.12em] disabled:opacity-60 ${
                        row.featured ? "bg-[#FFD200]" : "bg-white"
                      }`}
                      style={{ fontFamily: mono }}
                    >
                      {row.featured ? "Featured" : "Feature"}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link
                      href={`/admin/place/${row.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="text-[11px] uppercase tracking-[0.14em] underline"
                      style={{ fontFamily: mono }}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={(event) => {
                        event.stopPropagation();
                        remove(row.id);
                      }}
                      className="ml-4 text-[11px] uppercase tracking-[0.14em] underline disabled:opacity-60"
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
