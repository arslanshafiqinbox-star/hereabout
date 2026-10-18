import Link from "next/link";
import { DatabaseNotice } from "@/components/DatabaseNotice";
import SearchBar from "@/components/SearchBar";
import { listSiteSponsors, type SiteSponsor } from "@/lib/directory-sponsors";
import { listPublicPlaces, findFeaturedPlace, type PublicPlace } from "@/lib/public-places";

const sans =
  "var(--font-bricolage), system-ui, -apple-system, 'Segoe UI', sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";
const serif = "var(--font-newsreader), Georgia, 'Times New Roman', serif";

function linkHref(value: string | undefined) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "/contact";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function sponsorCard(sponsor: SiteSponsor) {
  return {
    kind: sponsor.provider,
    title: sponsor.title,
    text: sponsor.tagline,
    action: sponsor.action,
    href: linkHref(sponsor.link),
    date: sponsor.date || undefined,
  };
}

function placeCard(place: PublicPlace) {
  return {
    kicker: [place.type, place.county].filter(Boolean).join(" · "),
    title: place.name,
    text: place.summary,
    score: `${place.score.toFixed(1)} / 5`,
    href: `/place/${place.id}`,
  };
}

export default async function Home() {
  try {
    return await HomeContent();
  } catch (error) {
    console.error(error);
    return <DatabaseNotice />;
  }
}

async function HomeContent() {
  const [food, events, directory, featured] = await Promise.all([
    listSiteSponsors("food-and-drink"),
    listSiteSponsors("events"),
    listPublicPlaces(),
    findFeaturedPlace(),
  ]);
  const topRated = [...directory].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, 4);
  const recentlyAdded = [...directory].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 4);

  return (
    <main className="bg-white text-black">
      <SearchBar />

      {featured ? (
      <section className="border-t-2 border-black">
        <div
          className="flex items-center justify-between px-5 pt-3 pb-2 text-[11px] uppercase tracking-[0.16em] sm:px-8 lg:px-10"
          style={{ fontFamily: mono, fontWeight: 500 }}
        >
          <p>Featured place</p>
          <p>{featured.county}</p>
        </div>
        <div className="border-t-2 border-black px-5 pt-6 pb-8 sm:px-8 lg:px-10 lg:pt-8">
          <h1
            className="w-fit max-w-full text-[clamp(4.5rem,14vw,12rem)] leading-[0.78] tracking-[-0.055em] break-words hover:bg-[#FFE14A] hover:shadow-[0_0_0_1.75rem_#FFE14A]"
            style={{ fontFamily: sans, fontWeight: 800 }}
          >
            {featured.name}
          </h1>
          <p
            className="mt-5 max-w-[18rem] text-[clamp(1.5rem,3.2vw,2.25rem)] leading-[1.02]"
            style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 500 }}
          >
            {featured.summary}
          </p>
          <div className="mt-8 grid items-stretch lg:grid-cols-2">
            <div className="space-y-4 text-[15px] leading-[1.55] lg:border-r-2 lg:border-black lg:pr-8" style={{ fontFamily: sans }}>
              {featured.primary ? <p>{featured.primary}</p> : null}
              {featured.secondary ? <p>{featured.secondary}</p> : null}
            </div>
            <div className="lg:pl-8">
              {featured.comment ? (
                <p className="text-[15px] leading-[1.55]" style={{ fontFamily: sans }}>
                  {featured.comment}
                </p>
              ) : null}
              {featured.ourTake ? (
                <div className="mt-5 border-2 border-black px-3 py-2.5">
                  <p
                    className="text-[10px] uppercase tracking-[0.16em]"
                    style={{ fontFamily: mono, fontWeight: 500 }}
                  >
                    Our take
                  </p>
                  <p className="mt-1 text-[15px] leading-snug" style={{ fontFamily: sans, fontWeight: 500 }}>
                    {featured.ourTake}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t-2 border-black px-5 py-3 sm:px-8 lg:px-10">
          <p
            className="border-2 border-black px-1.5 py-0.5 text-[14px] leading-none"
            style={{ fontFamily: sans, fontWeight: 600 }}
          >
            {featured.score.toFixed(1)} / 5
          </p>
          <Link
            href={`/place/${featured.id}`}
            className="bg-black px-3 py-2 text-[14px] text-white"
            style={{ fontFamily: sans, fontWeight: 600 }}
          >
            Read the full verdict
          </Link>
        </div>
      </section>
      ) : null}

      {topRated.length > 0 ? (
        <HomeStrip
          label="Top rated"
          action="See the full directory"
          href="/directory"
          cards={topRated.map(placeCard)}
        />
      ) : null}
      {recentlyAdded.length > 0 ? (
        <HomeStrip
          label="Recently added"
          action="See the full directory"
          href="/directory"
          cards={recentlyAdded.map(placeCard)}
        />
      ) : null}

      <AdRow
        label="Eat, drink and stay"
        pitch="Restaurants, cafés, hotels and B&Bs: reach people deciding where to go next."
        cards={food.sponsors.map(sponsorCard)}
      />
      {food.main ? <MainStrip sponsor={food.main} /> : null}
      <AdRow
        label="Events, holidays and things to do"
        pitch="Events, holidays and things to do: reach people planning their next trip."
        cards={events.sponsors.map(sponsorCard)}
      />
      {events.main ? <MainStrip sponsor={events.main} /> : null}
    </main>
  );
}

function HomeStrip({
  label,
  action,
  href,
  cards,
}: {
  label: string;
  action: string;
  href: string;
  cards: Array<{
    kicker: string;
    title: string;
    text: string;
    score: string;
    meta?: string;
    time?: string;
    href?: string;
  }>;
}) {
  return (
    <section className="border-t-2 border-black">
      <div
        className="flex items-center justify-between bg-black px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-white sm:px-8 lg:px-10"
        style={{ fontFamily: mono, fontWeight: 500 }}
      >
        <p>{label}</p>
        <Link href={href} className="hover:underline">
          {action}
        </Link>
      </div>
      <div className="grid lg:grid-cols-4">
        {cards.map((card) => (
          <StripCard key={card.title} href={card.href}>
            <p
              className="text-[10px] uppercase tracking-[0.12em]"
              style={{ fontFamily: mono, fontWeight: 500 }}
            >
              {card.kicker}
            </p>
            <h2
              className="mt-3 text-[1.65rem] leading-[1.05] tracking-[-0.03em]"
              style={{ fontFamily: sans, fontWeight: 800 }}
            >
              {card.title}
            </h2>
            <p
              className="mt-3 text-[15px] leading-relaxed"
              style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 500 }}
            >
              {card.text}
            </p>
            <p
              className="mt-6 border-t-2 border-black pt-3 text-[13px]"
              style={{ fontFamily: sans }}
            >
              {card.meta ? (
                <span
                  className="mr-3 text-[11px] uppercase tracking-[0.08em]"
                  style={{ fontFamily: mono, fontWeight: 500 }}
                >
                  {card.meta}
                </span>
              ) : null}
              {card.time ? (
                <span
                  className="mr-3 text-[11px] uppercase tracking-[0.08em]"
                  style={{ fontFamily: mono, fontWeight: 500 }}
                >
                  {card.time}
                </span>
              ) : null}
              {card.score}
            </p>
          </StripCard>
        ))}
      </div>
    </section>
  );
}

function AdRow({
  label,
  pitch,
  cards,
}: {
  label: string;
  pitch: string;
  cards: Array<{ kind: string; title: string; text: string; action: string; href: string; date?: string }>;
}) {
  return (
    <section className="border-t-2 border-black">
      <div
        className="flex items-center justify-between bg-black px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-white sm:px-8 lg:px-10"
        style={{ fontFamily: mono, fontWeight: 500 }}
      >
        <p>{label}</p>
        <p>
          Advertisements ·{" "}
          <Link href="/contact" className="underline">
            Advertise with us
          </Link>
        </p>
      </div>
      <div className="grid lg:grid-cols-4">
        {cards.map((card) => (
          <article key={card.title} className="flex flex-col border-b-2 border-black lg:border-r-2 lg:border-b-0">
            <p
              className="flex items-center justify-between border-b-2 border-black bg-[#FFE14A] px-4 py-1.5 text-[10px] uppercase tracking-[0.1em]"
              style={{ fontFamily: mono, fontWeight: 500 }}
            >
              <span>Advertisement</span>
              <span>{card.kind}</span>
            </p>
            <div className="flex flex-1 flex-col px-4 py-4">
              <h2
                className="text-[1.7rem] leading-[0.95] tracking-[-0.03em]"
                style={{ fontFamily: sans, fontWeight: 800 }}
              >
                {card.title}
              </h2>
              {card.date ? (
                <span
                  className="mt-3 inline-block self-start bg-black px-1.5 py-1 text-[10px] uppercase tracking-[0.08em] text-white"
                  style={{ fontFamily: mono, fontWeight: 500 }}
                >
                  {card.date}
                </span>
              ) : null}
              <p className="mt-3 text-[15px] leading-snug" style={{ fontFamily: sans }}>
                {card.text}
              </p>
              <a
                href={card.href}
                target="_blank"
                rel="noreferrer"
                className="mt-5 self-start border-2 border-black px-3 py-1.5 text-[14px]"
                style={{ fontFamily: sans }}
              >
                {card.action}
              </a>
            </div>
          </article>
        ))}
        <article className="flex flex-col bg-black text-white">
          <p
            className="flex items-center justify-between px-4 py-1.5 text-[10px] uppercase tracking-[0.1em]"
            style={{ fontFamily: mono, fontWeight: 500 }}
          >
            <span>Advertise here</span>
            <span>Your business</span>
          </p>
          <div className="flex flex-1 flex-col px-4 py-4">
            <h2
              className="text-[1.7rem] leading-[0.95] tracking-[-0.03em]"
              style={{ fontFamily: sans, fontWeight: 800 }}
            >
              Your business here.
            </h2>
            <p className="mt-3 text-[15px] leading-snug" style={{ fontFamily: sans }}>
              {pitch}
            </p>
            <Link
              href="/contact"
              className="mt-5 self-start border-2 border-white px-3 py-1.5 text-[14px]"
              style={{ fontFamily: sans }}
            >
              Advertise with us
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}

function MainStrip({ sponsor }: { sponsor: SiteSponsor }) {
  return (
    <article className="flex flex-col border-y-2 border-black sm:flex-row">
      <p
        className="flex shrink-0 flex-col justify-center bg-[#FFE14A] px-4 py-4 text-[10px] uppercase leading-tight tracking-[0.1em]"
        style={{ fontFamily: mono, fontWeight: 500 }}
      >
        Advertisement
        <br />
        {sponsor.provider}
      </p>
      <div className="flex min-w-0 flex-1 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
        <p className="min-w-0 flex-1 text-[15px]" style={{ fontFamily: sans }}>
          <span className="text-[1.65rem] tracking-[-0.03em] break-words" style={{ fontWeight: 800 }}>
            {sponsor.title}
          </span>{" "}
          {sponsor.tagline}
        </p>
        {sponsor.date ? (
          <span
            className="w-fit shrink-0 bg-black px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-white"
            style={{ fontFamily: mono, fontWeight: 500 }}
          >
            {sponsor.date}
          </span>
        ) : null}
        <a
          href={linkHref(sponsor.link)}
          target="_blank"
          rel="noreferrer"
          className="w-fit shrink-0 border-2 border-black px-3 py-1.5 text-[14px]"
          style={{ fontFamily: sans }}
        >
          {sponsor.action}
        </a>
      </div>
    </article>
  );
}

function StripCard({ href, children }: { href?: string; children: React.ReactNode }) {
  const className =
    "flex min-h-full flex-col border-b-2 border-black px-5 py-6 hover:bg-[#FFE14A] lg:border-r-2 lg:border-b-0 lg:[&:nth-child(4n)]:border-r-0";
  if (!href) return <article className={className}>{children}</article>;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
