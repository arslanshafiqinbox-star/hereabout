"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const sans = "var(--font-bricolage), system-ui, sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

export type EntityRow = {
  id: string;
  name: string;
  description: string;
};

type DialogState = { mode: "create" } | { mode: "edit"; row: EntityRow } | null;

export function EntityManager({
  title,
  endpoint,
  rows,
}: {
  title: string;
  endpoint: string;
  rows: EntityRow[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);

  useEffect(() => {
    if (!dialog) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDialog(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog]);

  async function send(method: "POST" | "PUT" | "DELETE", payload?: EntityRow & { previousId?: string }, id?: string) {
    setMessage("");
    setPending(true);
    const response = await fetch(method === "DELETE" ? `${endpoint}?id=${encodeURIComponent(id ?? "")}` : endpoint, {
      method,
      headers: method === "DELETE" ? undefined : { "Content-Type": "application/json" },
      body: method === "DELETE" ? undefined : JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    setPending(false);
    if (!response.ok) {
      setMessage(body?.message || "Could not save that.");
      return false;
    }
    setDialog(null);
    router.refresh();
    return true;
  }

  const editing = dialog?.mode === "edit" ? dialog.row : null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      id: editing?.id ?? "",
      name: String(data.get("name") ?? ""),
      description: String(data.get("description") ?? ""),
    };
    if (dialog?.mode === "edit") {
      await send("PUT", { ...payload, previousId: dialog.row.id });
      return;
    }
    await send("POST", payload);
  }

  return (
    <main className="px-5 py-10 sm:px-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: mono }}>
            {rows.length} {rows.length === 1 ? "row" : "rows"}
          </p>
          <h1 className="mt-2 text-5xl leading-none tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 560 }}>
            {title}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setMessage("");
            setDialog({ mode: "create" });
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
        <table className="w-full min-w-[52rem] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-black bg-neutral-50">
              {["Name", "Description", ""].map((heading) => (
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
                <td colSpan={3} className="px-4 py-6 text-sm" style={{ fontFamily: sans }}>
                  Nothing here yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b-2 border-black last:border-b-0">
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans, fontWeight: 600 }}>
                    {row.name}
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                    {row.description}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setMessage("");
                        setDialog({ mode: "edit", row });
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setDialog(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="entity-dialog-title"
            className="w-full max-w-lg border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="entity-dialog-title" className="text-3xl tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 560 }}>
              {editing ? `Edit ${title.toLowerCase()}` : `Add ${title.toLowerCase()}`}
            </h2>
            <form key={editing?.id ?? "create"} onSubmit={onSubmit} className="mt-6 grid gap-4">
              <Field label="Name" name="name" defaultValue={editing?.name} />
              <Field label="Description" name="description" defaultValue={editing?.description} />
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
      <input
        required
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-12 w-full border-2 border-black px-3 outline-none"
        style={{ fontFamily: sans }}
      />
    </label>
  );
}
