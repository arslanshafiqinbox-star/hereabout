"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const sans = "var(--font-bricolage), system-ui, -apple-system, 'Segoe UI', sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

const links = [
  { href: "/admin", label: "Home" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/type", label: "Type" },
  { href: "/admin/county", label: "County" },
  { href: "/admin/region", label: "Region" },
  { href: "/admin/place", label: "Place" },
  { href: "/admin/advertisement", label: "Advertisement" },
  { href: "/admin/comments", label: "Comments" },
  { href: "/admin/contact", label: "Contact" },
];

export function AdminTopBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white text-black">
      <div className="border-b-[3px] border-black">
        <p
          className="border-b-2 border-black px-5 py-3 text-[11px] uppercase leading-none tracking-[0.08em]"
          style={{ fontFamily: mono, fontWeight: 500 }}
        >
          Hereabouts admin
        </p>
        <div className="flex min-h-[3.15rem] items-stretch">
          <Link
            href="/admin"
            className="flex items-center border-r-2 border-black px-4 text-[15px] uppercase leading-none tracking-[-0.02em] sm:px-5 sm:text-[19px]"
            style={{ fontFamily: sans, fontWeight: 800 }}
          >
            Hereabouts
          </Link>
          <div className="min-w-8 flex-1 border-r-2 border-black" aria-hidden="true" />
          <nav className="flex items-stretch" aria-label="Admin">
            {links.map((link) => {
              const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center whitespace-nowrap border-r-2 border-black px-4 text-[15px] leading-none sm:px-[1.15rem] ${
                    active ? "bg-[#FFD200]" : "bg-white hover:bg-neutral-100"
                  }`}
                  style={{ fontFamily: sans, fontWeight: 500 }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={signOut}
            className="flex items-center whitespace-nowrap bg-black px-4 text-[14px] leading-none text-white hover:bg-neutral-800 sm:px-[1.15rem] sm:text-[15px]"
            style={{ fontFamily: sans, fontWeight: 500 }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
