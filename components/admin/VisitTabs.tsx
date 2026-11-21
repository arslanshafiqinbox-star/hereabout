import Link from "next/link";

const sans = "var(--font-bricolage), system-ui, sans-serif";

export function VisitTabs({
  placeId,
  visitId,
  active,
}: {
  placeId: string;
  visitId: string;
  active: "article" | "advertisements" | "comments";
}) {
  const base = `/admin/place/${placeId}/visits/${visitId}`;
  const tabs = [
    { href: base, id: "article" as const, label: "Article" },
    { href: `${base}/advertisements`, id: "advertisements" as const, label: "Advertisement" },
    { href: `${base}/comments`, id: "comments" as const, label: "Comments" },
  ];

  return (
    <nav className="mt-6 flex w-fit border-2 border-black" aria-label="Place to visit sections">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          aria-current={active === tab.id ? "page" : undefined}
          className={`border-r-2 border-black px-5 py-3 text-[15px] last:border-r-0 ${
            active === tab.id ? "bg-[#FFD200]" : "bg-white hover:bg-neutral-100"
          }`}
          style={{ fontFamily: sans, fontWeight: 500 }}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
