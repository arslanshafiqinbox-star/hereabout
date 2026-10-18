"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const sans = "var(--font-bricolage), system-ui, sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";
const serif = "var(--font-newsreader), Georgia, serif";

export function AdminLogin({ mode }: { mode: "login" | "setup" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
    };
    const response = await fetch(mode === "setup" ? "/api/admin/users" : "/api/admin/login", {
      method: mode === "setup" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    setPending(false);
    if (!response.ok) {
      setError(body?.message || "Something went wrong.");
      return;
    }
    if (mode === "setup") {
      const signedIn = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: payload.email, password: payload.password }),
      });
      if (!signedIn.ok) {
        setError("The admin was created. Sign in with those details.");
        router.refresh();
        return;
      }
    }
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <p className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: mono }}>
        Hereabouts · Admin
      </p>
      <h1 className="mt-3 text-5xl leading-none tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 560 }}>
        {mode === "setup" ? "Create the first admin" : "Sign in"}
      </h1>
      <p className="mt-4 text-[1.25rem] leading-snug text-neutral-700" style={{ fontFamily: serif, fontStyle: "italic" }}>
        {mode === "setup"
          ? "No admin exists yet. This account is stored in MongoDB with the role admin."
          : "Staff only. Your role decides what you can change."}
      </p>
      <form onSubmit={onSubmit} className="mt-8 border-2 border-black p-5 shadow-[6px_6px_0_0_#000]">
        {mode === "setup" ? <Field label="Name" name="name" type="text" /> : null}
        <Field label="Email" name="email" type="email" />
        <Field label="Password" name="password" type="password" />
        {error ? (
          <p className="mt-4 text-sm" style={{ fontFamily: sans }}>
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-5 border-2 border-black bg-[#FFD200] px-5 py-3 text-sm uppercase tracking-[0.14em] disabled:opacity-60"
          style={{ fontFamily: mono }}
        >
          {pending ? "Working…" : mode === "setup" ? "Create admin" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

function Field({ label, name, type }: { label: string; name: string; type: string }) {
  return (
    <label className="mt-4 block first:mt-0">
      <span className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
        {label}
      </span>
      <input
        required
        name={name}
        type={type}
        minLength={type === "password" ? 8 : undefined}
        className="mt-2 h-12 w-full border-2 border-black px-3 text-base outline-none"
        style={{ fontFamily: sans }}
      />
    </label>
  );
}
