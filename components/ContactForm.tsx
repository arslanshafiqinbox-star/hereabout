"use client";

import { FormEvent, useEffect, useState } from "react";

const sans = "var(--font-bricolage), system-ui, -apple-system, 'Segoe UI', sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";
const serif = "var(--font-newsreader), Georgia, 'Times New Roman', serif";

const steps = [
  "Tell us about your business and where it is.",
  "Choose a placement that suits you.",
  "We label it as an advertisement and it goes live.",
];

const businessTypes = [
  "Restaurant or café",
  "Hotel or B&B",
  "Pub",
  "Shop",
  "Event",
  "Holiday",
  "Attraction",
  "Other",
];

export default function ContactForm({ places }: { places: string[] }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const businessType = String(data.get("business_type") ?? "");
    const place = String(data.get("place") ?? "");
    setPending(true);
    setMessage("");
    setSent(false);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_name: String(data.get("business_name") ?? ""),
        your_name: String(data.get("your_name") ?? ""),
        business_email: String(data.get("business_email") ?? ""),
        business_type: businessType,
        place,
        subject: [businessType, place].filter(Boolean).join(" · "),
        message: String(data.get("message") ?? ""),
        kind: "advertise",
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
      <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <p className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono, fontWeight: 500 }}>
          For businesses
        </p>
        <h1
          className="mt-6 max-w-[11ch] text-[clamp(3.4rem,11vw,7.4rem)] leading-[0.84] tracking-[-0.055em]"
          style={{ fontFamily: sans, fontWeight: 800 }}
        >
          Advertise with Hereabouts
        </h1>
        <p
          className="mt-8 max-w-[26rem] text-[clamp(1.35rem,2.4vw,1.85rem)] leading-[1.15]"
          style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 500 }}
        >
          Put your restaurant, hotel, event, holiday or attraction in front of people who are deciding where to go next.
        </p>
        <a
          href="#enquiry"
          className="mt-10 inline-block bg-black px-5 py-3 text-[16px] text-white"
          style={{ fontFamily: sans, fontWeight: 650 }}
        >
          Get in touch
        </a>
      </section>

      <section>
        <div
          className="flex items-center justify-between gap-4 bg-black px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-white sm:px-8 lg:px-10"
          style={{ fontFamily: mono, fontWeight: 500 }}
        >
          <p>How it works</p>
          <p>Three steps</p>
        </div>
        <ol>
          {steps.map((step, index) => (
            <li key={step} className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-3 border-b border-black px-5 py-3.5 sm:grid-cols-[3.6rem_minmax(0,1fr)] sm:gap-6 sm:px-8 sm:py-4 lg:px-10">
              <span className="text-[2.15rem] leading-none tracking-[-0.045em] sm:text-[2.65rem]" style={{ fontFamily: sans, fontWeight: 720 }}>
                {index + 1}
              </span>
              <p className="text-[1.05rem] leading-[1.15] tracking-[-0.02em] sm:text-[1.28rem]" style={{ fontFamily: sans, fontWeight: 520 }}>
                {step}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section id="enquiry" className="scroll-mt-24">
        <div
          className="bg-black px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-white sm:px-8 lg:px-10"
          style={{ fontFamily: mono, fontWeight: 500 }}
        >
          Get in touch
        </div>
        <form onSubmit={onSubmit} className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Business name" name="business_name" />
            <Field label="Your name" name="your_name" />
            <Field label="Email" name="business_email" type="email" />
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2 md:max-w-3xl">
            <Select label="Type of business" name="business_type" options={businessTypes} />
            <Select label="Where are you?" name="place" options={places.length > 0 ? places : ["Somewhere else"]} />
          </div>
          <label className="mt-5 block max-w-4xl">
            <span className="text-[15px]" style={{ fontFamily: sans }}>
              What would you like to promote?
            </span>
            <textarea
              required
              name="message"
              rows={5}
              placeholder="A sentence or two is plenty."
              className="mt-2 w-full border-2 border-black px-3 py-2 text-[15px] outline-none placeholder:text-neutral-500"
              style={{ fontFamily: sans }}
            />
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
            {pending ? "Sending…" : "Send enquiry"}
          </button>
        </form>
      </section>

      {sent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setSent(false)}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="contact-sent-title"
            aria-describedby="contact-sent-text"
            className="w-full max-w-lg border-2 border-black bg-[#FFD200] p-6 shadow-[12px_12px_0_0_#000] sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono, fontWeight: 500 }}>
              Query submitted
            </p>
            <h2
              id="contact-sent-title"
              className="mt-3 text-[clamp(3.4rem,8vw,5.2rem)] leading-[0.82] tracking-[-0.05em]"
              style={{ fontFamily: sans, fontWeight: 800 }}
            >
              Submitted.
            </h2>
            <p id="contact-sent-text" className="mt-4 max-w-sm text-[18px] leading-snug" style={{ fontFamily: sans }}>
              Our representative will connect with you.
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
