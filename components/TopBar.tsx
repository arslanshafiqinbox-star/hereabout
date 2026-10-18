"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { placeSlug, places } from "@/lib/places";

const navLinks = [
  { href: "/directory", label: "Directory" },
  { href: "/places", label: "Places to visit" },
  { href: "/villages", label: "Villages" },
  { href: "/towns", label: "Towns" },
  { href: "/cities", label: "Cities" },
];

const sans = "var(--font-bricolage), system-ui, -apple-system, 'Segoe UI', sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

const typeNav: Record<string, string> = {
  Village: "/villages",
  Town: "/towns",
  City: "/cities",
};

export default function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const placeId = pathname.match(/^\/place\/([^/]+)/)?.[1];
  const placeType = places.find((place) => placeSlug(place.name) === placeId)?.type;
  const typeHref = placeType ? typeNav[placeType] : undefined;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-white text-black">
      <div className="border-b-[3px] border-black">
        <p
          className="border-b-2 border-black px-4 py-3 text-[11px] uppercase leading-snug tracking-[0.08em] sm:px-5 sm:py-4 sm:text-xs"
          style={{ fontFamily: mono, fontWeight: 500 }}
        >
          Reviews of English villages, towns and cities
        </p>

        <div className="flex min-h-[3.15rem] items-stretch lg:hidden">
          <Link
            href="/"
            className="flex flex-1 items-center px-4 text-[15px] uppercase leading-none tracking-[-0.02em]"
            style={{ fontFamily: sans, fontWeight: 800 }}
          >
            Hereabouts
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="site-sidebar"
            onClick={() => setOpen((current) => !current)}
            className={`flex items-center gap-3 border-l-2 border-black px-4 text-[13px] uppercase tracking-[0.12em] ${
              open ? "bg-[#FFD200]" : "bg-white"
            }`}
            style={{ fontFamily: mono, fontWeight: 500 }}
          >
            <span className="flex flex-col gap-[5px]" aria-hidden="true">
              <span className="block h-[2px] w-5 bg-black" />
              <span className="block h-[2px] w-5 bg-black" />
              <span className="block h-[2px] w-5 bg-black" />
            </span>
            {open ? "Close" : "Menu"}
          </button>
        </div>

        <div className="hidden w-full min-w-0 overflow-x-auto lg:block">
          <div className="flex min-h-[3.15rem] w-max min-w-full items-stretch">
            <Link
              href="/"
              className="flex items-center border-r-2 border-black px-5 text-[19px] uppercase leading-none tracking-[-0.02em]"
              style={{
                fontFamily: sans,
                fontWeight: 800,
                fontVariationSettings: '"opsz" 48, "wdth" 100',
              }}
            >
              Hereabouts
            </Link>

            <div className="min-w-8 flex-1 border-r-2 border-black" aria-hidden="true" />

            <nav className="flex items-stretch" aria-label="Primary">
              {navLinks.map((link) => (
                <BarLink key={link.href} href={link.href} active={isActive(pathname, link.href, typeHref)}>
                  {link.label}
                </BarLink>
              ))}
              <Link
                href="/contact"
                className="flex items-center whitespace-nowrap bg-black px-[1.15rem] text-[15px] leading-none text-white hover:bg-neutral-800"
                style={{
                  fontFamily: sans,
                  fontWeight: 500,
                  fontVariationSettings: '"opsz" 16, "wdth" 100',
                }}
              >
                Advertise with us
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        id="site-sidebar"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(20rem,88vw)] flex-col border-r-2 border-black bg-white transition-transform duration-200 lg:hidden ${
          open ? "translate-x-0" : "pointer-events-none -translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b-2 border-black px-5 py-4">
          <p className="text-[15px] uppercase tracking-[-0.02em]" style={{ fontFamily: sans, fontWeight: 800 }}>
            Hereabouts
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="border-2 border-black px-3 py-1.5 text-[11px] uppercase tracking-[0.12em]"
            style={{ fontFamily: mono }}
          >
            Close
          </button>
        </div>
        <nav className="flex flex-1 flex-col" aria-label="Primary">
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href, typeHref);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`border-b-2 border-black px-5 py-4 text-[1.35rem] leading-none tracking-[-0.03em] ${
                  active ? "bg-[#FFD200]" : "bg-white"
                }`}
                style={{ fontFamily: sans, fontWeight: 650 }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/contact"
          onClick={() => setOpen(false)}
          className="bg-black px-5 py-5 text-[1.15rem] leading-none text-white"
          style={{ fontFamily: sans, fontWeight: 650 }}
        >
          Advertise with us
        </Link>
      </aside>
    </header>
  );
}

function isActive(pathname: string, href: string, typeHref?: string) {
  return pathname === href || pathname.startsWith(`${href}/`) || href === typeHref;
}

function BarLink({ href, active, children }: { href: string; active: boolean; children: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      style={{
        fontFamily: sans,
        fontWeight: 500,
        fontVariationSettings: '"opsz" 16, "wdth" 100',
      }}
      className={`flex items-center whitespace-nowrap border-r-2 border-black px-[1.15rem] text-[15px] leading-none ${
        active ? "bg-[#FFD200]" : "bg-white hover:bg-neutral-100"
      }`}
    >
      {children}
    </Link>
  );
}
