"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { HtmlEditor } from "@/components/admin/HtmlEditor";
import type { PlaceOption, PlaceRow, PlaceScore } from "@/components/admin/PlaceManager";

const sans = "var(--font-bricolage), system-ui, sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

const scoreFields: { key: keyof PlaceScore; label: string }[] = [
  { key: "character", label: "Character" },
  { key: "food_drink", label: "Food & drink" },
  { key: "walks", label: "Walks" },
  { key: "getting_together", label: "Getting together" },
  { key: "value", label: "Value" },
];

export function PlaceForm({
  place,
  types,
  counties,
  regions,
}: {
  place: PlaceRow | null;
  types: PlaceOption[];
  counties: PlaceOption[];
  regions: PlaceOption[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [primaryDes, setPrimaryDes] = useState(place?.primary_des ?? "");
  const [secondaryDes, setSecondaryDes] = useState(place?.secondary_des ?? "");
  const listsReady = types.length > 0 && counties.length > 0 && regions.length > 0;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);
    const data = new FormData(event.currentTarget);
    const score = Object.fromEntries(scoreFields.map((field) => [field.key, Number(data.get(field.key))])) as PlaceScore;
    const response = await fetch("/api/admin/place", {
      method: place ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: place?.id,
        name: String(data.get("name") ?? ""),
        tagline: String(data.get("tagline") ?? ""),
        type_id: String(data.get("type_id") ?? ""),
        county_id: String(data.get("county_id") ?? ""),
        region_id: String(data.get("region_id") ?? ""),
        local_authority: String(data.get("local_authority") ?? ""),
        closest_station: String(data.get("closest_station") ?? ""),
        closest_station_location: String(data.get("closest_station_location") ?? ""),
        score,
        our_take: String(data.get("our_take") ?? ""),
        comment_to_be_displayed: String(data.get("comment_to_be_displayed") ?? ""),
        primary_des: primaryDes,
        secondary_des: secondaryDes,
      }),
    });
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    setPending(false);
    if (!response.ok) {
      setMessage(body?.message || "Could not save that place.");
      return;
    }
    router.push("/admin/place");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: mono }}>
        <Link href="/admin/place" className="underline">
          Place
        </Link>
      </p>
      <h1 className="mt-2 text-5xl leading-none tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 560 }}>
        {place ? "Edit place" : "Add place"}
      </h1>
      {listsReady ? (
        <form onSubmit={onSubmit} className="mt-8 grid gap-5">
          <Field label="Name" name="name" defaultValue={place?.name} />
          <Field label="Tagline" name="tagline" defaultValue={place?.tagline} />
          <Select label="Type" name="type_id" options={types} defaultValue={place?.type_id} />
          <Select label="County" name="county_id" options={counties} defaultValue={place?.county_id} />
          <Select label="Region" name="region_id" options={regions} defaultValue={place?.region_id} />
          <Field label="Local authority" name="local_authority" defaultValue={place?.local_authority} />
          <Field label="Closest station" name="closest_station" defaultValue={place?.closest_station} />
          <Field label="Closest station location" name="closest_station_location" defaultValue={place?.closest_station_location} />
          <fieldset>
            <legend className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
              Score
            </legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-5">
              {scoreFields.map((field) => (
                <label key={field.key} className="block">
                  <span className="text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: mono }}>
                    {field.label}
                  </span>
                  <input
                    required
                    name={field.key}
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    defaultValue={place?.score[field.key] ?? ""}
                    className="mt-2 h-12 w-full border-2 border-black px-3 outline-none"
                    style={{ fontFamily: sans }}
                  />
                </label>
              ))}
            </div>
          </fieldset>
          <Area label="Our take" name="our_take" defaultValue={place?.our_take} />
          <Area label="Comment to be displayed" name="comment_to_be_displayed" defaultValue={place?.comment_to_be_displayed} />
          <HtmlEditor label="Primary description" value={primaryDes} onChange={setPrimaryDes} />
          <HtmlEditor label="Secondary description" value={secondaryDes} onChange={setSecondaryDes} />
          {message ? (
            <p className="text-sm" style={{ fontFamily: sans }}>
              {message}
            </p>
          ) : null}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="border-2 border-black bg-[#FFD200] px-5 py-3 text-[11px] uppercase tracking-[0.14em] disabled:opacity-60"
              style={{ fontFamily: mono }}
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <Link href="/admin/place" className="border-2 border-black px-5 py-3 text-[11px] uppercase tracking-[0.14em]" style={{ fontFamily: mono }}>
              Cancel
            </Link>
          </div>
        </form>
      ) : (
        <p className="mt-8 text-sm" style={{ fontFamily: sans }}>
          Add at least one type, county, and region before creating a place.
        </p>
      )}
    </main>
  );
}

function Area({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
        {label}
      </span>
      <textarea required name={name} defaultValue={defaultValue} rows={4} className="mt-2 w-full border-2 border-black px-3 py-2 outline-none" style={{ fontFamily: sans }} />
    </label>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
        {label}
      </span>
      <input required name={name} defaultValue={defaultValue} className="mt-2 h-12 w-full border-2 border-black px-3 outline-none" style={{ fontFamily: sans }} />
    </label>
  );
}

function Select({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: PlaceOption[];
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
        {label}
      </span>
      <select required name={name} defaultValue={defaultValue ?? ""} className="mt-2 h-12 w-full border-2 border-black bg-white px-3 outline-none" style={{ fontFamily: sans }}>
        <option value="" disabled>
          Choose
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}
