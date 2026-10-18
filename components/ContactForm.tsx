"use client";

import { FormEvent, useEffect, useState } from "react";

const sans = "var(--font-bricolage), system-ui, -apple-system, 'Segoe UI', sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";
const serif = "var(--font-newsreader), Georgia, 'Times New Roman', serif";

const reasons = [
  { label: "01", title: "Advertise", text: "A strip, a card, or a place on the page beside the thing people are already reading." },
  { label: "02", title: "A listing", text: "A village, town, city, or somewhere to visit that should be in the directory." },
  { label: "03", title: "A correction", text: "A fact, a score, or a sentence that has gone out of date." },
];

export default function ContactForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setMessage("");
    setSent(false);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_name: String(data.get("business_name") ?? ""),
        business_email: String(data.get("business_email") ?? ""),
        subject: String(data.get("subject") ?? ""),
        message: String(data.get("message") ?? ""),
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
    <main className="border-t-2 border-black bg-white text-black">
      <div
        className="flex items-center justify-between gap-4 bg-black px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-white sm:px-8"
        style={{ fontFamily: mono, fontWeight: 500 }}
      >
        <p>For businesses</p>
        <p className="hidden sm:block">Advertising · Listings · Corrections</p>
      </div>

      {sent ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setSent(false)}
        >
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

      <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,36rem)]">
        <section className="border-b-2 border-black px-5 py-8 sm:px-8 lg:border-r-2 lg:border-b-0 lg:py-12">
          <h1
            className="w-fit max-w-full text-[clamp(4.6rem,13vw,9rem)] leading-[0.78] tracking-[-0.055em] break-words hover:bg-[#FFE14A] hover:shadow-[0_0_0_0.7rem_#FFE14A]"
            style={{ fontFamily: sans, fontWeight: 800 }}
          >
            Contact.
          </h1>
          <p
            className="mt-6 max-w-[18rem] text-[clamp(1.45rem,2.6vw,2.15rem)] leading-[1.05]"
            style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 500 }}
          >
            Tell us about the business, and what you want on the page.
          </p>
          <div className="mt-10 border-2 border-black">
            {reasons.map((reason) => (
              <article key={reason.title} className="border-b-2 border-black px-4 py-4 last:border-b-0 sm:px-5">
                <p className="text-[11px] uppercase tracking-[0.14em]" style={{ fontFamily: mono, fontWeight: 500 }}>
                  {reason.label}
                </p>
                <h2 className="mt-1 text-[1.55rem] leading-none tracking-[-0.03em]" style={{ fontFamily: sans, fontWeight: 700 }}>
                  {reason.title}
                </h2>
                <p className="mt-2 max-w-md text-[15px] leading-snug" style={{ fontFamily: sans }}>
                  {reason.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <form onSubmit={onSubmit} className="flex flex-col">
            <p
              className="flex items-center justify-between bg-[#FFE14A] px-5 py-2 text-[11px] uppercase tracking-[0.14em] sm:px-6"
              style={{ fontFamily: mono, fontWeight: 500 }}
            >
              <span>Your query</span>
              <span>Four fields</span>
            </p>
            <Field label="Business name" name="business_name" placeholder="The name people should see" />
            <Field label="Business email" name="business_email" type="email" placeholder="name@business.com" />
            <Field label="Subject" name="subject" placeholder="Advertising, a listing, or a correction" />
            <label className="block border-b-2 border-black lg:border-b-0">
              <span className="block px-5 pt-4 text-[11px] uppercase tracking-[0.14em] sm:px-6" style={{ fontFamily: mono, fontWeight: 500 }}>
                Message
              </span>
              <textarea
                required
                name="message"
                rows={7}
                placeholder="What should we know?"
                className="w-full resize-y bg-white px-5 py-3 text-[16px] leading-relaxed outline-none placeholder:text-neutral-400 sm:px-6"
                style={{ fontFamily: sans }}
              />
            </label>
            {message ? (
              <p className="border-t-2 border-black px-5 py-3 text-[15px] sm:px-6" style={{ fontFamily: sans }}>
                {message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="mt-auto bg-black px-5 py-4 text-left text-[16px] text-white disabled:opacity-60 sm:px-6"
              style={{ fontFamily: sans, fontWeight: 650 }}
            >
              {pending ? "Sending…" : "Send query"}
            </button>
          </form>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block border-b-2 border-black">
      <span className="block px-5 pt-4 text-[11px] uppercase tracking-[0.14em] sm:px-6" style={{ fontFamily: mono, fontWeight: 500 }}>
        {label}
      </span>
      <input
        required
        type={type}
        name={name}
        placeholder={placeholder}
        className="h-12 w-full bg-white px-5 text-[16px] outline-none placeholder:text-neutral-400 sm:px-6"
        style={{ fontFamily: sans }}
      />
    </label>
  );
}
