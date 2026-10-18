import Link from "next/link";

const sans =
  "var(--font-bricolage), system-ui, -apple-system, 'Segoe UI', sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

const readLinks = [
  { href: "/directory", label: "Directory" },
  { href: "/places", label: "Places to visit" },
  { href: "/villages", label: "Villages" },
  { href: "/towns", label: "Towns" },
  { href: "/cities", label: "Cities" },
];

export default function BottomBar() {
  return (
    <footer className="border-t-2 mt-20 border-black bg-white text-black">
      <div className="border-b-2 border-black px-5 py-4 sm:px-6">
        <p
          className="text-[1.35rem] uppercase leading-none tracking-[-0.03em]"
          style={{ fontFamily: sans, fontWeight: 800 }}
        >
          Hereabouts
        </p>
      </div>

      <div className="grid border-b-2 border-black sm:grid-cols-2 lg:grid-cols-4">
        <section className="border-b-2 border-black px-5 py-5 sm:px-6 lg:border-r-2 lg:border-b-0">
          <h2 className="w-fit bg-[#FFE14A] px-1 text-[11px] uppercase tracking-[0.08em]" style={{ fontFamily: mono, fontWeight: 500 }}>
            About
          </h2>
          <p className="mt-3 max-w-[18rem] text-[15px] leading-snug" style={{ fontFamily: sans }}>
            A guide to the UK&apos;s villages, towns, cities and places to visit.
          </p>
          <p className="mt-4 text-[15px]" style={{ fontFamily: sans }}>
            <Link href="/contact" className="underline">
              Contact
            </Link>
          </p>
          <a
            href="mailto:hello@hereabouts.example"
            className="text-[15px] underline"
            style={{ fontFamily: sans }}
          >
            hello@hereabouts.example
          </a>
        </section>

        <section className="border-b-2 border-black px-5 py-5 sm:border-r-2 sm:border-b-0 sm:px-6 lg:border-r-2">
          <h2 className="w-fit bg-[#FFE14A] px-1 text-[11px] uppercase tracking-[0.08em]" style={{ fontFamily: mono, fontWeight: 500 }}>
            Read
          </h2>
          <ul className="mt-3 space-y-1">
            {readLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-[15px] underline" style={{ fontFamily: sans }}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-b-2 border-black px-5 py-5 sm:px-6 lg:border-r-2 lg:border-b-0">
          <h2 className="w-fit bg-[#FFE14A] px-1 text-[11px] uppercase tracking-[0.08em]" style={{ fontFamily: mono, fontWeight: 500 }}>
            Data and type
          </h2>
          <p className="mt-3 max-w-[16rem] text-[15px] leading-snug" style={{ fontFamily: sans }}>
            Set in Bricolage Grotesque, Newsreader and IBM Plex Mono.
          </p>
          <p className="mt-3 text-[15px]" style={{ fontFamily: sans }}>
            Corrections welcome.
          </p>
        </section>

        <section className="px-5 py-5 sm:px-6">
          <h2 className="w-fit bg-[#FFE14A] px-1 text-[11px] uppercase tracking-[0.08em]" style={{ fontFamily: mono, fontWeight: 500 }}>
            For businesses
          </h2>
          <ul className="mt-3 space-y-1">
            <li>
              <Link href="/contact" className="text-[15px] underline" style={{ fontFamily: sans }}>
                Advertise with us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-[15px] underline" style={{ fontFamily: sans }}>
                Advertising terms
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-[15px] underline" style={{ fontFamily: sans }}>
                ads@hereabouts.example
              </Link>
            </li>
          </ul>
        </section>
      </div>

      <div
        className="flex flex-col gap-2 px-5 py-3 text-[11px] uppercase tracking-[0.08em] sm:flex-row sm:items-center sm:justify-between sm:px-6"
        style={{ fontFamily: mono, fontWeight: 500 }}
      >
        <p>© 2026 Hereabouts</p>
        <p>Fuelled by tea and mild disagreement</p>
      </div>
    </footer>
  );
}
