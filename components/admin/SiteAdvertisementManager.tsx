"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const sans = "var(--font-bricolage), system-ui, sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

export type SiteAdvertisementRow = {
  id: string;
  provider: string;
  title: string;
  tagline: string;
  action: string;
  link: string;
  date: string;
  section: "directory" | "place-to-visit" | "food-and-drink" | "events";
  kind: "main" | "ad";
  archived: boolean;
};

const sections = [
  { id: "directory", label: "Directory" },
  { id: "place-to-visit", label: "Place to visit" },
  { id: "food-and-drink", label: "Food & drink" },
  { id: "events", label: "Events" },
] as const;

function linkHref(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function SiteAdvertisementManager({ rows }: { rows: SiteAdvertisementRow[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [dialog, setDialog] = useState<SiteAdvertisementRow | "create" | null>(null);
  const [mainForm, setMainForm] = useState(false);
  const [section, setSection] = useState<(typeof sections)[number]["id"]>("directory");
  const editing = dialog && dialog !== "create" ? dialog : null;
  const visible = rows.filter((row) => row.section === section && row.kind !== "main" && !row.archived);
  const main = rows.find((row) => row.section === section && row.kind === "main" && !row.archived) ?? null;

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
    const response = await fetch(
      method === "DELETE" ? `/api/admin/site-advertisement?id=${encodeURIComponent(id ?? "")}` : "/api/admin/site-advertisement",
      {
        method,
        headers: method === "DELETE" ? undefined : { "Content-Type": "application/json" },
        body: method === "DELETE" ? undefined : JSON.stringify(payload),
      },
    );
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    setPending(false);
    if (!response.ok) {
      setMessage(body?.message || "Could not save that advertisement.");
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
      provider: String(data.get("provider") ?? ""),
      title: String(data.get("title") ?? ""),
      tagline: String(data.get("tagline") ?? ""),
      action: String(data.get("action") ?? ""),
      link: String(data.get("link") ?? ""),
      date: String(data.get("date") ?? ""),
      section: editing?.section ?? section,
      kind: editing?.kind === "main" || mainForm ? "main" : "ad",
    });
  }

  function openForm(next: SiteAdvertisementRow | "create", asMain: boolean) {
    setMessage("");
    setMainForm(asMain);
    setDialog(next);
  }

  async function archiveMain() {
    if (!main) return;
    setMessage("");
    setPending(true);
    const response = await fetch("/api/admin/site-advertisement", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: main.id }),
    });
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    setPending(false);
    if (!response.ok) {
      setMessage(body?.message || "Could not archive that sponsor.");
      return;
    }
    router.refresh();
  }

  return (
    <main className="px-5 py-10 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: mono }}>
        {visible.length} {visible.length === 1 ? "advertisement" : "advertisements"}
      </p>
      <h1 className="mt-2 text-5xl leading-none tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 560 }}>
        Advertisement
      </h1>
      <div className="mt-6 flex w-fit flex-wrap border-2 border-black" role="tablist" aria-label="Advertisement sections">
        {sections.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={section === item.id}
            onClick={() => setSection(item.id)}
            className={`border-r-2 border-black px-5 py-3 text-[15px] last:border-r-0 ${
              section === item.id ? "bg-[#FFD200]" : "bg-white hover:bg-neutral-100"
            }`}
            style={{ fontFamily: sans, fontWeight: 500 }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <section className="mt-8 border-2 border-black p-5">
        <p className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
          Main sponsor
        </p>
        {main ? (
          <div className="mt-3 flex items-start justify-between gap-6">
            <div>
              <p className="text-2xl tracking-[-0.03em]" style={{ fontFamily: sans, fontWeight: 560 }}>
                {main.title}
              </p>
              <p className="mt-2 text-sm" style={{ fontFamily: sans }}>
                {main.provider}
                {main.tagline ? ` · ${main.tagline}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button type="button" onClick={() => openForm(main, true)} className="text-[11px] uppercase tracking-[0.14em] underline" style={{ fontFamily: mono }}>
                Edit
              </button>
              <button type="button" disabled={pending} onClick={archiveMain} className="text-[11px] uppercase tracking-[0.14em] underline disabled:opacity-60" style={{ fontFamily: mono }}>
                Archive
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-between gap-6">
            <p className="text-sm" style={{ fontFamily: sans }}>
              One main sponsor for this section. Archive it before adding another.
            </p>
            <button
              type="button"
              onClick={() => openForm("create", true)}
              className="shrink-0 border-2 border-black bg-[#FFD200] px-5 py-3 text-[11px] uppercase tracking-[0.14em]"
              style={{ fontFamily: mono }}
            >
              Add main sponsor
            </button>
          </div>
        )}
      </section>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => openForm("create", false)}
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
              {["Title", "Provider", "Date", "Action", "Link", ""].map((heading) => (
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
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-sm" style={{ fontFamily: sans }}>
                  No advertisements yet.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.id} className="border-b-2 border-black last:border-b-0">
                  <td className="border-r-2 border-black px-4 py-3">
                    <p style={{ fontFamily: sans, fontWeight: 600 }}>{row.title}</p>
                    <p className="mt-1 text-sm text-neutral-600" style={{ fontFamily: sans }}>
                      {row.tagline}
                    </p>
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                    {row.provider}
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                    {row.date}
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                    {row.action}
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                    <a href={linkHref(row.link)} target="_blank" rel="noreferrer" className="underline">
                      Open <span aria-hidden="true">↗</span>
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openForm(row, false)}
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
            aria-labelledby="site-ad-dialog-title"
            className="max-h-full w-full max-w-lg overflow-y-auto border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="site-ad-dialog-title" className="text-3xl tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 560 }}>
              {editing?.kind === "main" || mainForm ? (editing ? "Edit main sponsor" : "Add main sponsor") : editing ? "Edit advertisement" : "Add advertisement"}
            </h2>
            <p className="mt-2 text-sm" style={{ fontFamily: sans }}>
              {sections.find((item) => item.id === (editing?.section ?? section))?.label}
            </p>
            <form key={editing?.id ?? "create"} onSubmit={onSubmit} className="mt-6 grid gap-4">
              <Field label="Provider" name="provider" defaultValue={editing?.provider} />
              <Field label="Title" name="title" defaultValue={editing?.title} />
              <Field label="Tagline" name="tagline" defaultValue={editing?.tagline} />
              <Field label="Action" name="action" defaultValue={editing?.action} />
              <Field label="Link" name="link" defaultValue={editing?.link} />
              <Field label="Date" name="date" defaultValue={editing?.date} optional />
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

function Field({
  label,
  name,
  defaultValue,
  optional = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
        {label}
      </span>
      <input
        required={!optional}
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-12 w-full border-2 border-black px-3 outline-none"
        style={{ fontFamily: sans }}
      />
    </label>
  );
}
