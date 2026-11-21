"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState, type ReactNode } from "react";

const sans = "var(--font-bricolage), system-ui, -apple-system, 'Segoe UI', sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";
const serif = "var(--font-newsreader), Georgia, 'Times New Roman', serif";

const topics = ["A general question", "A correction", "Suggest a place", "A review I disagree with", "Advertising"];

const notes = [
  {
    title: "Corrections",
    body: "Spotted something wrong? Tell us the page and what needs fixing, and we will update it.",
  },
  {
    title: "Suggest a place",
    body: "Know a village, town or place to visit we should cover? Choose “Suggest a place” and tell us why.",
  },
];

export default function ContactMessageForm({ places }: { places: string[] }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("your_name") ?? "");
    const topic = String(data.get("topic") ?? "");
    const place = String(data.get("place") ?? "");
    const aboutOnePlace = place && place !== "Not about one place";
    if (data.get("consent") !== "on") {
      setMessage("Tick the box so we can reply.");
      return;
    }
    setPending(true);
    setMessage("");
    setSent(false);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_name: name,
        your_name: name,
        business_email: String(data.get("email") ?? ""),
        business_type: topic,
        place: aboutOnePlace ? place : "",
        subject: aboutOnePlace ? `${topic} · ${place}` : topic,
        message: String(data.get("message") ?? ""),
        consent: true,
        kind: "contact",
      }),
    });
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    setPending(false);
    if (!response.ok) {
      setMessage(body?.message || "Could not send that.");
      return;
    }
    form.reset();
    setSent(true);
  }

  useEffect(() => {
    if (!sent) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSent(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sent]);

  return (
    <main className="bg-white text-black">
      <section className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <p className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono, fontWeight: 500 }}>
          Get in touch
        </p>
        <h1
          className="mt-5 text-[clamp(3.8rem,12vw,7.6rem)] leading-[0.84] tracking-[-0.055em]"
          style={{ fontFamily: sans, fontWeight: 800 }}
        >
          Contact us
        </h1>
        <p
          className="mt-7 max-w-[24rem] text-[clamp(1.35rem,2.4vw,1.85rem)] leading-[1.15]"
          style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 500 }}
        >
          Questions, corrections, a place we have missed or a review you disagree with. We read everything.
        </p>
      </section>

      <div
        className="flex items-center justify-between gap-4 bg-black px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-white sm:px-8 lg:px-10"
        style={{ fontFamily: mono, fontWeight: 500 }}
      >
        <p>Send us a message</p>
        <p className="text-right">All fields required unless marked</p>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        <form onSubmit={onSubmit} className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Your name" name="your_name" />
            <Field label="Email" name="email" type="email" />
            <Select label="What is it about?" name="topic" options={topics} />
            <Select label="Which place? (optional)" name="place" options={["Not about one place", ...places]} />
          </div>
          <label className="mt-5 block">
            <span className="text-[15px]" style={{ fontFamily: sans }}>
              Message
            </span>
            <textarea
              required
              name="message"
              rows={7}
              placeholder="Tell us what is on your mind. For corrections, say what is wrong and where you saw it."
              className="mt-2 w-full border-2 border-black px-3 py-2 text-[15px] outline-none placeholder:text-neutral-500"
              style={{ fontFamily: sans }}
            />
          </label>
          <label className="mt-5 flex items-start gap-3 text-[15px]" style={{ fontFamily: sans }}>
            <input required type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-black" />
            <span>I am happy for Hereabouts to use these details to reply to me.</span>
          </label>
          {message ? (
            <p className="mt-4 text-[15px]" style={{ fontFamily: sans }}>
              {message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-6 bg-black px-4 py-2.5 text-[15px] text-white disabled:opacity-60"
            style={{ fontFamily: sans, fontWeight: 650 }}
          >
            {pending ? "Sending…" : "Send message"}
          </button>
        </form>

        <aside className="border-t-2 border-black px-5 py-6 sm:px-8 lg:border-t-0 lg:border-l-2 lg:px-5 lg:py-8">
          <div className="grid gap-4">
            {notes.map((note) => (
              <Note key={note.title} title={note.title}>
                {note.body}
              </Note>
            ))}
            <Note title="Advertising">
              For placements and prices, see{" "}
              <Link href="/advertise" className="underline">
                Advertise with us
              </Link>{" "}
              or choose “Advertising” here.
            </Note>
          </div>
        </aside>
      </div>

      {sent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setSent(false)}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="message-sent-title"
            aria-describedby="message-sent-text"
            className="w-full max-w-lg border-2 border-black bg-[#FFD200] p-6 shadow-[12px_12px_0_0_#000] sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono, fontWeight: 500 }}>
              Message sent
            </p>
            <h2
              id="message-sent-title"
              className="mt-3 text-[clamp(3.4rem,8vw,5.2rem)] leading-[0.82] tracking-[-0.05em]"
              style={{ fontFamily: sans, fontWeight: 800 }}
            >
              Sent.
            </h2>
            <p id="message-sent-text" className="mt-4 max-w-sm text-[18px] leading-snug" style={{ fontFamily: sans }}>
              We read everything.
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => setSent(false)}
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

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-[15px]" style={{ fontFamily: sans }}>
        {label}
      </span>
      <input
        required
        type={type}
        name={name}
        className="mt-2 h-11 w-full border-2 border-black bg-white px-3 text-[15px] outline-none"
        style={{ fontFamily: sans }}
      />
    </label>
  );
}

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label className="block">
      <span className="text-[15px]" style={{ fontFamily: sans }}>
        {label}
      </span>
      <select
        required
        name={name}
        defaultValue={options[0]}
        className="mt-2 h-11 w-full border-2 border-black bg-white px-3 text-[15px] outline-none"
        style={{ fontFamily: sans }}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="border-2 border-black px-4 py-4">
      <h2 className="text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: mono, fontWeight: 500 }}>
        {title}
      </h2>
      <p className="mt-2 text-[15px] leading-snug" style={{ fontFamily: sans }}>
        {children}
      </p>
    </article>
  );
}
