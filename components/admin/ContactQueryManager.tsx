"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const sans = "var(--font-bricolage), system-ui, sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

export type ContactQueryRow = {
  id: string;
  businessName: string;
  businessEmail: string;
  subject: string;
  message: string;
  answered: boolean;
  when: string;
};

type DialogState = { mode: "create" } | { mode: "edit"; row: ContactQueryRow } | null;

export function ContactQueryManager({ rows }: { rows: ContactQueryRow[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [tab, setTab] = useState<"unanswered" | "answered">("unanswered");
  const editing = dialog?.mode === "edit" ? dialog.row : null;
  const unanswered = rows.filter((row) => !row.answered);
  const answered = rows.filter((row) => row.answered);
  const visible = tab === "answered" ? answered : unanswered;

  useEffect(() => {
    if (!dialog) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDialog(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog]);

  async function send(method: "POST" | "PUT" | "DELETE", payload?: Record<string, string | boolean>, id?: string) {
    setMessage("");
    setPending(true);
    const response = await fetch(method === "DELETE" ? `/api/admin/contact?id=${encodeURIComponent(id ?? "")}` : "/api/admin/contact", {
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

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      id: editing?.id ?? "",
      business_name: String(data.get("business_name") ?? ""),
      business_email: String(data.get("business_email") ?? ""),
      subject: String(data.get("subject") ?? ""),
      message: String(data.get("message") ?? ""),
      answered: data.get("answered") === "on",
    };
    await send(editing ? "PUT" : "POST", payload);
  }

  return (
    <main className="px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: mono }}>
            {visible.length} {visible.length === 1 ? "query" : "queries"}
          </p>
          <h1 className="mt-2 text-5xl leading-none tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 560 }}>
            Contact
          </h1>
          <div className="mt-5 flex w-fit border-2 border-black" role="tablist" aria-label="Query status">
            {(
              [
                ["unanswered", `Unanswered ${unanswered.length}`],
                ["answered", `Answered ${answered.length}`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`border-r-2 border-black px-4 py-2 text-[12px] uppercase tracking-[0.12em] last:border-r-0 ${
                  tab === id ? "bg-[#FFD200]" : "bg-white"
                }`}
                style={{ fontFamily: mono }}
              >
                {label}
              </button>
            ))}
          </div>
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
        <table className="w-full min-w-[64rem] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-black bg-neutral-50">
              {["Business name", "Business email", "Subject", "Message", "When", "Answered", ""].map((heading) => (
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
                <td colSpan={7} className="px-4 py-6 text-sm" style={{ fontFamily: sans }}>
                  {rows.length === 0 ? "No queries yet." : tab === "answered" ? "No answered queries." : "No unanswered queries."}
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.id} className="border-b-2 border-black align-top last:border-b-0">
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans, fontWeight: 600 }}>
                    {row.businessName}
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                    {row.businessEmail}
                  </td>
                  <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                    {row.subject}
                  </td>
                  <td className="max-w-md border-r-2 border-black px-4 py-3 whitespace-pre-wrap" style={{ fontFamily: sans }}>
                    {row.message}
                  </td>
                  <td className="border-r-2 border-black px-4 py-3 whitespace-nowrap" style={{ fontFamily: mono }}>
                    {row.when}
                  </td>
                  <td className="border-r-2 border-black px-4 py-3 whitespace-nowrap" style={{ fontFamily: mono }}>
                    {row.answered ? "Yes" : "No"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        send(
                          "PUT",
                          {
                            id: row.id,
                            business_name: row.businessName,
                            business_email: row.businessEmail,
                            subject: row.subject,
                            message: row.message,
                            answered: !row.answered,
                          },
                        )
                      }
                      className="mr-4 text-[11px] uppercase tracking-[0.14em] underline disabled:opacity-50"
                      style={{ fontFamily: mono }}
                    >
                      {row.answered ? "Mark unanswered" : "Mark answered"}
                    </button>
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
            aria-labelledby="contact-dialog-title"
            className="w-full max-w-lg border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="contact-dialog-title" className="text-3xl tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 560 }}>
              {editing ? "Edit query" : "Add query"}
            </h2>
            <form key={editing?.id ?? "create"} onSubmit={onSubmit} className="mt-6 grid gap-4">
              <Field label="Business name" name="business_name" defaultValue={editing?.businessName} />
              <Field label="Business email" name="business_email" type="email" defaultValue={editing?.businessEmail} />
              <Field label="Subject" name="subject" defaultValue={editing?.subject} />
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
                  Message
                </span>
                <textarea
                  required
                  name="message"
                  defaultValue={editing?.message}
                  rows={5}
                  className="mt-2 w-full border-2 border-black px-3 py-2 outline-none"
                  style={{ fontFamily: sans }}
                />
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="answered"
                  defaultChecked={editing?.answered === true}
                  className="h-4 w-4 accent-black"
                />
                <span className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
                  Answered
                </span>
              </label>
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
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
        {label}
      </span>
      <input
        required
        type={type}
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-12 w-full border-2 border-black px-3 outline-none"
        style={{ fontFamily: sans }}
      />
    </label>
  );
}
