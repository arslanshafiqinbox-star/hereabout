"use client";

import Link from "next/link";
import { useState } from "react";
import PlaceComments from "@/components/PlaceComments";
import type { PlaceSectionAd } from "@/lib/place-advertisements";

const sans = "var(--font-bricolage), system-ui, -apple-system, 'Segoe UI', sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";
const serif = "var(--font-newsreader), Georgia, 'Times New Roman', serif";

const shareNames = ["Facebook", "X", "WhatsApp", "Bluesky", "LinkedIn", "Reddit", "Email"] as const;

export type VisitScore = { label: string; score: number };

export type VisitArticleData = {
  id: string;
  title: string;
  text: string;
  kind: string;
  time: string;
  price: string;
  bestTime: string;
  mapUrl: string;
  station: string;
  stationHref: string;
  goIf: string[];
  skipIf: string[];
  video: string;
  placeName: string;
  placeHref: string;
  county: string;
  region: string;
  score: number | null;
  ratings: VisitScore[];
  article: string;
  placeId?: string;
  others: Array<{ title: string; href: string; score: number | null }>;
  hero: PlaceSectionAd[];
  between: PlaceSectionAd[];
  eat: PlaceSectionAd[];
  events: PlaceSectionAd[];
};

function mapLink(location: string, fallback: string) {
  const value = location.trim() || fallback;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
}

function linkHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function adHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "/advertise";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function VisitView({ visit }: { visit: VisitArticleData }) {
  const [copied, setCopied] = useState(false);
  const mapHref = mapLink(visit.mapUrl, `${visit.title}, ${visit.placeName}`);
  const stationHref = linkHref(visit.stationHref);
  const articleHtml = /<[a-z][\s\S]*>/i.test(visit.article);
  const guide = articleHtml
    ? []
    : visit.article
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
  const sidebarAd = visit.events[0] ?? visit.eat[0];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function shareNative() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: visit.title, url });
      } catch {
        /* dismissed */
      }
      return;
    }
    await copyLink();
  }

  return (
    <article className="bg-white text-black">
      <header className="border-b-2 border-black">
        <p
          className="border-b-2 border-black px-5 py-3 text-[11px] uppercase tracking-[0.16em] sm:px-8 lg:px-10"
          style={{ fontFamily: mono, fontWeight: 500 }}
        >
          <Link href="/directory" className="hover:underline">
            Directory
          </Link>
          {visit.region ? ` / ${visit.region}` : ""}
          {" / "}
          <Link href={visit.placeHref} className="hover:underline">
            {visit.placeName}
          </Link>
          {" / Places to visit / "}
          {visit.title}
        </p>
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_32rem]">
          <div className="px-5 py-6 sm:px-8 lg:border-r-2 lg:border-black lg:px-10 lg:py-8">
            <p className="text-[12px] uppercase tracking-[0.14em]" style={{ fontFamily: mono, fontWeight: 500 }}>
              {visit.kind || "Place to visit"}
              {" · "}
              <Link href={visit.placeHref} className="underline">
                {visit.placeName}
              </Link>
            </p>
            <h1
              className="mt-3 max-w-[14ch] text-[clamp(3.4rem,7vw,5.6rem)] leading-[0.86] tracking-[-0.05em]"
              style={{ fontFamily: sans, fontWeight: 800 }}
            >
              {visit.title}
            </h1>
            <p
              className="mt-4 max-w-[22ch] text-[clamp(1.6rem,2.6vw,2.15rem)] leading-[1.05]"
              style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 500 }}
            >
              {visit.text}
            </p>
            <p className="mt-6 text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: mono, fontWeight: 500 }}>
              By the Hereabouts team
            </p>
          </div>
          <div className="px-5 py-4 sm:px-6 lg:px-6 lg:py-5">
            <dl>
              <Fact label="Place" value={visit.placeName} href={visit.placeHref} />
              <Fact label="Type" value={visit.kind || "—"} />
              <Fact label="Time to allow" value={visit.time || "—"} />
              <Fact label="Cost" value={visit.price || "—"} />
              <Fact label="Best time" value={visit.bestTime || "—"} />
              <Fact label="Where" value="Open in Google Maps" href={mapHref} external />
              <Fact
                label="Closest station"
                value={visit.station || "—"}
                href={visit.station && stationHref ? stationHref : undefined}
                external
              />
              <Fact label="Reader rating" value={visit.score == null ? "—" : `${visit.score.toFixed(1)} / 5`} last />
            </dl>
          </div>
        </div>
      </header>

      {visit.hero.length > 0 ? <AdStrip ads={visit.hero} /> : null}

      <ShareBar copied={copied} onCopy={copyLink} onShare={shareNative} title={visit.title} />

      <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)_18.5rem]">
        <aside className="border-b-2 border-black px-5 py-6 lg:border-r-2 lg:border-b-0">
          <p className="text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: mono, fontWeight: 500 }}>
            How readers rated it
          </p>
          <ul className="mt-4">
            {visit.ratings.length === 0 ? (
              <li className="border-t-2 border-black py-2 text-[13px]" style={{ fontFamily: sans }}>
                No ratings yet.
              </li>
            ) : (
              visit.ratings.map((row) => (
                <li key={row.label} className="border-t-2 border-black py-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13px] leading-tight" style={{ fontFamily: sans, fontWeight: 650 }}>
                      {row.label}
                    </span>
                    <span className="text-[13px]" style={{ fontFamily: sans, fontWeight: 600 }}>
                      {row.score.toFixed(1)}
                    </span>
                  </div>
                  <ScoreBar score={row.score} />
                </li>
              ))
            )}
          </ul>
        </aside>

        <div className="border-b-2 border-black px-5 py-6 sm:px-8 lg:border-r-2 lg:border-b-0 lg:py-8">
          {articleHtml ? (
            <div
              className="w-full text-left text-[16px] leading-relaxed [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:tracking-[-0.03em] [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-4 [&_ul]:list-disc [&_ul]:pl-5"
              style={{ fontFamily: sans }}
              dangerouslySetInnerHTML={{ __html: visit.article }}
            />
          ) : (
            <div className="w-full space-y-4 text-left text-[16px] leading-relaxed" style={{ fontFamily: sans }}>
              {guide.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}
          <VideoEmbed link={visit.video} />
          <div className="mt-8">
            <ShareBar copied={copied} onCopy={copyLink} onShare={shareNative} title={visit.title} boxed />
          </div>
        </div>

        <aside className="px-4 py-6">
          {visit.goIf.length > 0 ? <Advice title="Go if" marker="+" lines={visit.goIf} /> : null}
          {visit.skipIf.length > 0 ? <Advice title="Skip if" marker="−" lines={visit.skipIf} /> : null}
          <a
            href="#comments"
            className="mt-4 block w-full bg-black px-3 py-2.5 text-center text-[14px] text-white"
            style={{ fontFamily: sans, fontWeight: 600 }}
          >
            Comment and rate
          </a>
          {visit.others.length > 0 ? (
            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: mono, fontWeight: 500 }}>
                More about {visit.placeName}
              </p>
              <ul className="mt-2 border-t-2 border-black">
                {visit.others.map((item) => (
                  <li key={item.href} className="border-b-2 border-black">
                    <Link
                      href={item.href}
                      className="flex items-baseline justify-between gap-3 py-2 text-[15px] leading-tight"
                      style={{ fontFamily: sans, fontWeight: 650 }}
                    >
                      <span>{item.title}</span>
                      {item.score != null ? (
                        <span className="shrink-0" style={{ fontWeight: 500 }}>
                          {item.score.toFixed(1)}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {sidebarAd ? (
            <div className="mt-4">
              <MiniAd ad={sidebarAd} place={visit.placeName} />
            </div>
          ) : null}
        </aside>
      </div>

      {visit.between.length > 0 ? <AdStrip ads={visit.between} /> : null}

      <AdBand
        id="eat-drink"
        kicker={`Eat, drink and stay in ${visit.placeName}`}
        cards={visit.eat}
        pitch="Restaurants, cafés, hotels and B&Bs: reach people deciding where to go next."
      />
      <AdBand
        id="events"
        kicker={`Events, holidays and things to do in ${visit.placeName}`}
        cards={visit.events}
        pitch="Events, holidays and things to do: reach people planning their next trip."
      />
      <PlaceComments placeName={visit.title} placeId={visit.placeId} visitId={visit.id} />
    </article>
  );
}

function ShareBar({
  copied,
  onCopy,
  onShare,
  title,
  boxed,
}: {
  copied: boolean;
  onCopy: () => void;
  onShare: () => void;
  title: string;
  boxed?: boolean;
}) {
  function openShare(name: (typeof shareNames)[number]) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    const hrefs: Record<(typeof shareNames)[number], string> = {
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      X: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      WhatsApp: `https://wa.me/?text=${text}%20${url}`,
      Bluesky: `https://bsky.app/intent/compose?text=${text}%20${url}`,
      LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      Reddit: `https://www.reddit.com/submit?url=${url}&title=${text}`,
      Email: `mailto:?subject=${text}&body=${url}`,
    };
    window.open(hrefs[name], name === "Email" ? "_self" : "_blank", "noopener,noreferrer");
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 px-4 py-2.5 ${boxed ? "border-2 border-black" : "border-b-2 border-black"}`}>
      <span className="shrink-0 pr-2 text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: mono, fontWeight: 500 }}>
        Share
      </span>
      {shareNames.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => openShare(name)}
          className="shrink-0 border border-black px-2.5 py-1 text-[13px]"
          style={{ fontFamily: sans }}
        >
          {name}
        </button>
      ))}
      <button type="button" onClick={onCopy} className="shrink-0 border border-black px-2.5 py-1 text-[13px]" style={{ fontFamily: sans }}>
        {copied ? "Copied" : "Copy link"}
      </button>
      <button
        type="button"
        onClick={onShare}
        className="shrink-0 bg-black px-2.5 py-1 text-[13px] text-white"
        style={{ fontFamily: sans, fontWeight: 600 }}
      >
        Share…
      </button>
    </div>
  );
}

function VideoEmbed({ link }: { link: string }) {
  const embed = embedSrc(link);
  if (!embed) return null;
  return (
    <section className="mx-auto mt-8 max-w-[40rem] text-center">
      <p className="text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: mono, fontWeight: 500 }}>
        Video
      </p>
      <iframe title="Visit video" src={embed} className="mt-3 aspect-video w-full border-2 border-black" allow="fullscreen" />
    </section>
  );
}

function embedSrc(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const youtube = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/i);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;
  const vimeo = trimmed.match(/vimeo\.com\/(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return "";
}

function Advice({ title, marker, lines }: { title: string; marker: string; lines: string[] }) {
  return (
    <div className="mt-4 first:mt-0">
      <p className="text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: mono, fontWeight: 500 }}>
        {title}
      </p>
      <ul className="mt-2">
        {lines.map((line) => (
          <li key={line} className="flex gap-2 border-b-2 border-black py-1.5 text-[13px] leading-tight" style={{ fontFamily: sans, fontWeight: 550 }}>
            <span aria-hidden="true">{marker}</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Fact({
  label,
  value,
  href,
  external,
  last,
}: {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
  last?: boolean;
}) {
  const className = "text-right text-[13px] leading-none tracking-[-0.01em] underline decoration-2 underline-offset-2";
  return (
    <div className={`flex items-baseline justify-between gap-6 py-2 ${last ? "" : "border-b-2 border-black"}`}>
      <dt className="shrink-0 text-[9px] uppercase tracking-[0.14em] text-black" style={{ fontFamily: mono, fontWeight: 600 }}>
        {label}
      </dt>
      <dd className="text-right text-[13px] leading-none tracking-[-0.01em]" style={{ fontFamily: sans, fontWeight: 650 }}>
        {href && external ? (
          <a href={href} className={className} target="_blank" rel="noreferrer">
            {value} <span aria-hidden="true">↗</span>
          </a>
        ) : href ? (
          <Link href={href} className={className}>
            {value}
          </Link>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(score)));
  return (
    <div className="mt-2 flex max-w-[7.5rem] gap-1" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={`h-2 flex-1 ${index < filled ? "bg-[#2F8F4E]" : "bg-[#e5e5e5]"}`} />
      ))}
    </div>
  );
}

function AdStrip({ ads }: { ads: PlaceSectionAd[] }) {
  return (
    <div className="border-b-2 border-black">
      {ads.map((ad) => (
        <article key={ad.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b-2 border-black px-4 py-3 last:border-b-0 sm:px-5">
          <p
            className="shrink-0 bg-[#FFE14A] px-3 py-2 text-[10px] uppercase leading-tight tracking-[0.1em]"
            style={{ fontFamily: mono, fontWeight: 500 }}
          >
            Advertisement
            <br />
            {ad.provider}
          </p>
          <h2 className="text-[1.45rem] leading-none tracking-[-0.03em]" style={{ fontFamily: sans, fontWeight: 800 }}>
            {ad.title}
          </h2>
          {ad.date ? (
            <span className="bg-black px-1.5 py-1 text-[10px] uppercase tracking-[0.08em] text-white" style={{ fontFamily: mono }}>
              {ad.date}
            </span>
          ) : null}
          <p className="min-w-0 flex-1 text-[15px] leading-snug" style={{ fontFamily: sans }}>
            {ad.tagline}
          </p>
          <a
            href={adHref(ad.link)}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 border-2 border-black px-3 py-1.5 text-[14px]"
            style={{ fontFamily: sans }}
          >
            {ad.action}
          </a>
        </article>
      ))}
    </div>
  );
}

function MiniAd({ ad, place }: { ad: PlaceSectionAd; place: string }) {
  return (
    <article className="border-2 border-black">
      <div
        className="flex items-center justify-between border-b-2 border-black bg-[#FFE14A] px-3 py-1 text-[10px] uppercase tracking-[0.1em]"
        style={{ fontFamily: mono, fontWeight: 500 }}
      >
        <span>Advertisement</span>
        <span>
          {ad.provider} · {place}
        </span>
      </div>
      <div className="bg-white px-3 py-3">
        <h3 className="text-[1.45rem] leading-none tracking-[-0.03em]" style={{ fontFamily: sans, fontWeight: 800 }}>
          {ad.title}
        </h3>
        {ad.date ? (
          <span className="mt-2 inline-block bg-black px-1.5 py-1 text-[10px] uppercase tracking-[0.08em] text-white" style={{ fontFamily: mono }}>
            {ad.date}
          </span>
        ) : null}
        <p className="mt-2 text-[14px] leading-snug" style={{ fontFamily: sans }}>
          {ad.tagline}
        </p>
        <a href={adHref(ad.link)} target="_blank" rel="noreferrer" className="mt-3 inline-block border border-black px-3 py-1.5 text-[14px]" style={{ fontFamily: sans }}>
          {ad.action}
        </a>
      </div>
    </article>
  );
}

function AdBand({
  id,
  kicker,
  cards,
  pitch,
}: {
  id: string;
  kicker: string;
  cards: PlaceSectionAd[];
  pitch: string;
}) {
  return (
    <section id={id} className="scroll-mt-6 border-t-2 border-black">
      <div className="bg-black px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-white" style={{ fontFamily: mono, fontWeight: 500 }}>
        {kicker}
      </div>
      <div className="grid lg:grid-cols-4">
        {cards.map((card) => (
          <article key={card.id} className="flex flex-col border-b-2 border-black lg:border-r-2 lg:border-b-0">
            <p
              className="flex items-center justify-between border-b-2 border-black bg-[#FFE14A] px-4 py-1.5 text-[10px] uppercase tracking-[0.1em]"
              style={{ fontFamily: mono, fontWeight: 500 }}
            >
              <span>Advertisement</span>
              <span>{card.provider}</span>
            </p>
            <div className="flex flex-1 flex-col bg-white px-4 py-4">
              <h3 className="text-[1.6rem] leading-none tracking-[-0.03em]" style={{ fontFamily: sans, fontWeight: 800 }}>
                {card.title}
              </h3>
              {card.date ? (
                <span className="mt-2 inline-block self-start bg-black px-1.5 py-1 text-[10px] uppercase text-white" style={{ fontFamily: mono }}>
                  {card.date}
                </span>
              ) : null}
              <p className="mt-2 text-[14px] leading-snug" style={{ fontFamily: sans }}>
                {card.tagline}
              </p>
              <a
                href={adHref(card.link)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 self-start border border-black px-3 py-1.5 text-[14px]"
                style={{ fontFamily: sans }}
              >
                {card.action}
              </a>
            </div>
          </article>
        ))}
        <article className="flex flex-col bg-black text-white">
          <p className="flex items-center justify-between px-4 py-1.5 text-[10px] uppercase tracking-[0.1em]" style={{ fontFamily: mono, fontWeight: 500 }}>
            <span>Advertise here</span>
            <span>Your business</span>
          </p>
          <div className="flex flex-1 flex-col px-4 py-4">
            <h3 className="text-[1.7rem] leading-none tracking-[-0.03em]" style={{ fontFamily: sans, fontWeight: 800 }}>
              Your business here.
            </h3>
            <p className="mt-2 text-[14px] leading-snug" style={{ fontFamily: sans }}>
              {pitch}
            </p>
            <Link href="/advertise" className="mt-4 self-start border border-white px-3 py-1.5 text-[14px]" style={{ fontFamily: sans }}>
              Advertise with us
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
