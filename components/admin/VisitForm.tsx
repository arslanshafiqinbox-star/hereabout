"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { HtmlEditor } from "@/components/admin/HtmlEditor";
import { PlaceTabs } from "@/components/admin/PlaceTabs";
import { VisitTabs } from "@/components/admin/VisitTabs";
import type { VisitRow } from "@/components/admin/VisitManager";

const sans = "var(--font-bricolage), system-ui, sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

export function VisitForm({
  placeName,
  placeId,
  county,
  visit,
}: {
  placeName: string;
  placeId: string;
  county: string;
  visit: VisitRow | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [banner, setBanner] = useState<"" | "added" | "updated">("");
  const [nextHref, setNextHref] = useState("");
  const [article, setArticle] = useState(visit?.article ?? "");
  const [goIf, setGoIf] = useState(visit?.goIf.length ? visit.goIf : [""]);
  const [skipIf, setSkipIf] = useState(visit?.skipIf.length ? visit.skipIf : [""]);
  const listHref = `/admin/place/${placeId}/visits`;

  function closeBanner() {
    const href = nextHref || listHref;
    setBanner("");
    router.push(href);
    router.refresh();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/visit", {
      method: visit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: visit?.id,
        place_id: placeId,
        name: String(data.get("name") ?? ""),
        location: String(data.get("location") ?? ""),
        tagline: String(data.get("tagline") ?? ""),
        activity: String(data.get("activity") ?? ""),
        time: String(data.get("time") ?? ""),
        cost: String(data.get("cost") ?? ""),
        best_time: String(data.get("best_time") ?? ""),
        closest_station: String(data.get("closest_station") ?? ""),
        closest_station_location: String(data.get("closest_station_location") ?? ""),
        video: String(data.get("video") ?? ""),
        go_if: goIf,
        skip_if: skipIf,
        article,
      }),
    });
    const body = (await response.json().catch(() => null)) as { message?: string; id?: string } | null;
    setPending(false);
    if (!response.ok) {
      setMessage(body?.message || "Could not save that visit.");
      return;
    }
    const nextId = visit?.id || body?.id;
    setNextHref(nextId ? `/admin/place/${placeId}/visits/${nextId}` : listHref);
    setBanner(visit ? "updated" : "added");
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: mono }}>
        <Link href="/admin/place" className="underline">
          Place
        </Link>
        {" / "}
        <Link href={listHref} className="underline">
          {placeName}
        </Link>
      </p>
      {visit ? (
        <VisitTabs placeId={placeId} visitId={visit.id} active="article" />
      ) : (
        <PlaceTabs placeId={placeId} active="visits" />
      )}
      <h1 className="mt-6 text-5xl leading-none tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 560 }}>
        {visit ? visit.name : "Add a place to visit"}
      </h1>
      <p className="mt-3 text-[15px]" style={{ fontFamily: sans }}>
        {placeName}
        {county ? ` · ${county}` : ""}
      </p>
      <form onSubmit={onSubmit} className="mt-8 grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" name="name" defaultValue={visit?.name} />
          <Field label="Activity" name="activity" defaultValue={visit?.activity} />
          <Field label="Location" name="location" defaultValue={visit?.location} />
          <Field label="Time" name="time" defaultValue={visit?.time} />
          <Field label="Cost" name="cost" defaultValue={visit?.cost} />
          <Field label="Best time" name="best_time" defaultValue={visit?.bestTime} />
          <Field label="Closest station" name="closest_station" defaultValue={visit?.closestStation} />
          <Field label="Closest station location" name="closest_station_location" defaultValue={visit?.closestStationLocation} />
        </div>
        <Field label="Tagline" name="tagline" defaultValue={visit?.tagline} />
        <Field label="Video link" name="video" required={false} defaultValue={visit?.video} />
        <LineList label="Go if" lines={goIf} onChange={setGoIf} />
        <LineList label="Skip if" lines={skipIf} onChange={setSkipIf} />
        <HtmlEditor label="Article" value={article} onChange={setArticle} />
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
            {pending ? "Saving…" : visit ? "Save" : "Add"}
          </button>
          <Link href={listHref} className="border-2 border-black px-5 py-3 text-[11px] uppercase tracking-[0.14em]" style={{ fontFamily: mono }}>
            Cancel
          </Link>
        </div>
      </form>
      {banner ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={closeBanner}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="visit-saved-title"
            className="w-full max-w-lg border-2 border-black bg-[#FFD200] p-6 shadow-[12px_12px_0_0_#000] sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono, fontWeight: 500 }}>
              Place to visit
            </p>
            <h2
              id="visit-saved-title"
              className="mt-3 text-[clamp(3.4rem,8vw,5.2rem)] leading-[0.82] tracking-[-0.05em]"
              style={{ fontFamily: sans, fontWeight: 800 }}
            >
              {banner === "added" ? "Added." : "Updated."}
            </h2>
            <p className="mt-4 max-w-sm text-[18px] leading-snug" style={{ fontFamily: sans }}>
              {banner === "added" ? "This place to visit is on the list." : "Your changes are saved."}
            </p>
            <button
              type="button"
              autoFocus
              onClick={closeBanner}
              className="mt-8 bg-black px-5 py-3 text-[15px] text-white"
              style={{ fontFamily: sans, fontWeight: 650 }}
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required = true,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
        {label}
      </span>
      <input
        required={required}
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-12 w-full border-2 border-black px-3 outline-none"
        style={{ fontFamily: sans }}
      />
    </label>
  );
}

function LineList({ label, lines, onChange }: { label: string; lines: string[]; onChange: (lines: string[]) => void }) {
  return (
    <fieldset>
      <span className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
        {label}
      </span>
      <div className="mt-2 grid gap-2">
        {lines.map((line, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={line}
              onChange={(event) => onChange(lines.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
              className="h-12 min-w-0 flex-1 border-2 border-black px-3 outline-none"
              style={{ fontFamily: sans }}
            />
            <button
              type="button"
              onClick={() => onChange(lines.length === 1 ? [""] : lines.filter((_, itemIndex) => itemIndex !== index))}
              className="border-2 border-black px-3 text-[11px] uppercase tracking-[0.12em]"
              style={{ fontFamily: mono }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...lines, ""])}
        className="mt-2 border-2 border-black px-3 py-2 text-[11px] uppercase tracking-[0.12em]"
        style={{ fontFamily: mono }}
      >
        Add line
      </button>
    </fieldset>
  );
}
