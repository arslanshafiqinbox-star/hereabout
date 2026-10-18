"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
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
};

export function VisitManager({
  placeName,
  placeId,
  county,
  rows,
}: {
  placeName: string;
  placeId: string;
  county: string;
  rows: VisitRow[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [dialog, setDialog] = useState<VisitRow | "create" | null>(null);
  const editing = dialog && dialog !== "create" ? dialog : null;

  useEffect(() => {
    if (!dialog) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDialog(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog]);

  async function send(method: "POST" | "PUT" | "DELETE", payload?: Record<string, unknown>, id?: string) {
    setMessage("");
    setPending(true);
    const response = await fetch(method === "DELETE" ? `/api/admin/visit?id=${encodeURIComponent(id ?? "")}` : "/api/admin/visit", {
      method,
      headers: method === "DELETE" ? undefined : { "Content-Type": "application/json" },
      body: method === "DELETE" ? undefined : JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    setPending(false);
    if (!response.ok) {
      setMessage(body?.message || "Could not save that visit.");
      return;
    }
    setDialog(null);
    router.refresh();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await send(editing ? "PUT" : "POST", {
      id: editing?.id,
      place_id: editing?.place_id ?? placeId,
      name: String(data.get("name") ?? ""),
      location: String(data.get("location") ?? ""),
      tagline: String(data.get("tagline") ?? ""),
      activity: String(data.get("activity") ?? ""),
      time: String(data.get("time") ?? ""),
      cost: String(data.get("cost") ?? ""),
    });
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
        <button
          type="button"
          onClick={() => {
            setMessage("");
            setDialog("create");
          }}
          className="border-2 border-black bg-[#FFD200] px-5 py-3 text-[11px] uppercase tracking-[0.14em]"
          style={{ fontFamily: mono }}
        >
          Add
        </button>
      </div>
      {message && !dialog ? (
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
                    <p style={{ fontFamily: sans, fontWeight: 600 }}>{row.name}</p>
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
                    <button
                      type="button"
                      onClick={() => {
                        setMessage("");
                        setDialog(row);
                      }}
                      className="text-[11px] uppercase tracking-[0.14em] underline"
                      style={{ fontFamily: mono }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => send("DELETE", undefined, row.id)}
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

      {dialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6" onClick={() => setDialog(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="visit-dialog-title"
            className="max-h-full w-full max-w-lg overflow-y-auto border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="visit-dialog-title" className="text-3xl tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 560 }}>
              {editing ? "Edit visit" : "Add visit"}
            </h2>
            <p className="mt-2 text-sm" style={{ fontFamily: sans }}>
              {placeName}
              {county ? ` · ${county}` : ""}
            </p>
            <form key={editing?.id ?? "create"} onSubmit={onSubmit} className="mt-6 grid gap-4">
              <Field label="Name" name="name" defaultValue={editing?.name} />
              <Field label="Location" name="location" defaultValue={editing?.location} />
              <Field label="Tagline" name="tagline" defaultValue={editing?.tagline} />
              <Field label="Activity" name="activity" defaultValue={editing?.activity} />
              <Field label="Time" name="time" defaultValue={editing?.time} />
              <Field label="Cost" name="cost" defaultValue={editing?.cost} />
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
                  {pending ? "Saving…" : editing ? "Save" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => setDialog(null)}
                  className="border-2 border-black px-5 py-3 text-[11px] uppercase tracking-[0.14em]"
                  style={{ fontFamily: mono }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
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
