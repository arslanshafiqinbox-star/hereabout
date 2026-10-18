import Link from "next/link";

const sans = "var(--font-bricolage), system-ui, sans-serif";

export function PlaceTabs({
  placeId,
  active,
}: {
  placeId: string;
  active: "visits" | "advertisements" | "comments";
}) {
  const tabs = [
    { href: `/admin/place/${placeId}/visits`, id: "visits" as const, label: "Visit" },
    { href: `/admin/place/${placeId}/advertisements`, id: "advertisements" as const, label: "Advertisement" },
    { href: `/admin/place/${placeId}/comments`, id: "comments" as const, label: "Comments" },
  ];

  return (
    <nav className="mt-6 flex w-fit border-2 border-black" aria-label="Place sections">
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
