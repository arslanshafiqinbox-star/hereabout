"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const sans = "var(--font-bricolage), system-ui, sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

export function AdminHome({
  user,
}: {
  user: { name: string; email: string; role: "admin" | "editor" };
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function addUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        password: String(data.get("password") ?? ""),
        role: "admin",
      }),
    });
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    setPending(false);
    if (!response.ok) {
      setMessage(body?.message || "Could not add that admin.");
      return;
    }
    setMessage("Added.");
    event.currentTarget.reset();
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: mono }}>
        Signed in as {user.role}
      </p>
      <h1 className="mt-2 text-5xl leading-none tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 560 }}>
        {user.name}
      </h1>
      <p className="mt-3 text-sm" style={{ fontFamily: sans }}>
        {user.email}
      </p>

      {user.role === "admin" ? (
        <form onSubmit={addUser} className="mt-10 max-w-xl border-2 border-black p-5">
          <h2 className="text-2xl tracking-[-0.03em]" style={{ fontFamily: sans, fontWeight: 560 }}>
            Add an admin
          </h2>
          <label className="mt-4 block">
            <span className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
              Name
            </span>
            <input required name="name" className="mt-2 h-12 w-full border-2 border-black px-3 outline-none" style={{ fontFamily: sans }} />
          </label>
          <label className="mt-4 block">
            <span className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
              Email
            </span>
            <input required name="email" type="email" className="mt-2 h-12 w-full border-2 border-black px-3 outline-none" style={{ fontFamily: sans }} />
          </label>
          <label className="mt-4 block">
            <span className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
              Password
            </span>
            <input required name="password" type="password" minLength={8} className="mt-2 h-12 w-full border-2 border-black px-3 outline-none" style={{ fontFamily: sans }} />
          </label>
          {message ? (
            <p className="mt-4 text-sm" style={{ fontFamily: sans }}>
              {message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-5 border-2 border-black bg-[#FFD200] px-5 py-3 text-[11px] uppercase tracking-[0.14em] disabled:opacity-60"
            style={{ fontFamily: mono }}
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </form>
      ) : (
        <p className="mt-10 text-sm" style={{ fontFamily: sans }}>
          You are signed in as an editor. An admin can add another admin.
        </p>
      )}
    </main>
  );
}
