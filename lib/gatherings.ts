export const GATHERING_TYPES = [
  { id: "mawlid", label: "Mawlid" },
  { id: "dhikr", label: "Dhikr" },
  { id: "retreats", label: "Retreats" },
  { id: "study", label: "Study & Learning" },
  { id: "family", label: "Family" },
] as const;

export const GATHERING_TABS = [
  { id: "all", label: "All gatherings" },
  { id: "mawlid", label: "Mawlid" },
  { id: "dhikr", label: "Dhikr" },
  { id: "retreats", label: "Retreats" },
  { id: "study", label: "Study & Learning" },
  { id: "family", label: "Family" },
] as const;

export type GatheringTypeId = (typeof GATHERING_TYPES)[number]["id"];
export type GatheringTabId = (typeof GATHERING_TABS)[number]["id"];
export type DistanceFilter = 10 | 25 | "nationwide";

export type Gathering = {
  id: string;
  title: string;
  date: string;
  time: string;
  city: string;
  miles?: number;
  tags: string[];
  description: string;
  host: string;
  verified: boolean;
  type: GatheringTypeId;
  image: string;
};

const IMAGES = [
  "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=640&h=480&q=80",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=640&h=480&q=80",
  "https://images.unsplash.com/photo-1519817650390-64a6da070dff?auto=format&fit=crop&w=640&h=480&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=640&h=480&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=640&h=480&q=80",
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=640&h=480&q=80",
  "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=640&h=480&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=640&h=480&q=80",
];

const CITIES = [
  "Cardiff",
  "Manchester",
  "London",
  "Birmingham",
  "Leeds",
  "Bristol",
  "Glasgow",
  "Edinburgh",
  "Liverpool",
  "Oxford",
  "Cambridge",
  "Nottingham",
];

const HOSTS = [
  { name: "Radiant Hearts Collective", verified: true },
  { name: "Community-hosted", verified: false },
  { name: "Nur Circle", verified: true },
  { name: "Al-Huda Institute", verified: true },
  { name: "Open House Majlis", verified: false },
  { name: "Safa & Marwa Trust", verified: true },
];

const TITLES: Record<GatheringTypeId, string[]> = {
  mawlid: [
    "Evening Mawlid of Praise",
    "Mawlid under the Lamps",
    "A Night of Salawat",
    "Community Mawlid Gathering",
  ],
  dhikr: [
    "Thursday Dhikr Circle",
    "Open Dhikr & Tea",
    "Remembrance after Maghrib",
    "Weekly Hadra",
  ],
  retreats: [
    "Weekend Sufi Retreat",
    "Silent Morning at the Lodge",
    "Three-Day Contemplative Retreat",
    "Riverside Khulwa",
  ],
  study: [
    "Seerah Reading Circle",
    "Tafsir Study Evening",
    "Arabic for Beginners",
    "Fiqh Circle — Book II",
  ],
  family: [
    "Family Story & Craft Morning",
    "Open Picnic after Jumu'ah",
    "Children's Nasheed Hour",
    "Family Garden Gathering",
  ],
};

const TAGS: Record<GatheringTypeId, string[][]> = {
  mawlid: [["Evening", "all welcome"], ["Poetry", "tea"]],
  dhikr: [["Weekly", "open"], ["After Maghrib"]],
  retreats: [["Residential", "quiet"], ["Bring walking shoes"]],
  study: [["Books provided"], ["Beginner-friendly"]],
  family: [
    ["Craft tables", "under-10s"],
    ["Outdoor", "bring a dish"],
    ["Children welcome"],
  ],
};

const DESCRIPTIONS: Record<GatheringTypeId, string> = {
  mawlid:
    "A gathering of praise and poetry, with recitation, tea, and time to sit with neighbours after the programme.",
  dhikr:
    "An open circle of remembrance. Arrive when you can; stay as long as you like.",
  retreats:
    "A quiet few days of prayer, walking, and shared meals. Limited places, booked in advance.",
  study:
    "A close reading with space for questions. No prior study required, only curiosity.",
  family:
    "A gentle, child-friendly gathering with storytelling, simple crafts, and a shortened programme.",
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function dateFromOffset(start: Date, days: number) {
  const d = new Date(start);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function timesFor(index: number) {
  const hours = [10, 12, 13, 16, 19, 20];
  const hour = hours[index % hours.length];
  const suffix = hour < 12 ? "am" : "pm";
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelve}:00${suffix}`;
}

const FEATURED: Gathering[] = [
  {
    id: "featured-lanterns",
    title: "Little Lanterns: Family Mawlid Afternoon",
    date: "2026-09-26",
    time: "1:00pm",
    city: "Cardiff",
    miles: 143,
    tags: ["Craft tables", "under-10s"],
    description:
      "A gentle, child-friendly gathering with storytelling, craft tables and a shortened programme designed for young families.",
    host: "Radiant Hearts Collective",
    verified: true,
    type: "family",
    image: IMAGES[0],
  },
  {
    id: "featured-picnic",
    title: "Family Mawlid Picnic",
    date: "2026-09-27",
    time: "12:00pm",
    city: "Manchester",
    miles: 76,
    tags: ["Outdoor", "bring a dish"],
    description:
      "An informal park gathering for families, with a short Mawlid reading followed by an open picnic where everyone brings something to share.",
    host: "Community-hosted",
    verified: false,
    type: "family",
    image: IMAGES[1],
  },
];

function generatedGatherings(): Gathering[] {
  const types = GATHERING_TYPES.map((t) => t.id);
  const start = new Date(2026, 8, 12);
  const items: Gathering[] = [];

  for (let i = 0; i < 98; i += 1) {
    const type = types[i % types.length];
    const titlePool = TITLES[type];
    const host = HOSTS[i % HOSTS.length];
    const tagPool = TAGS[type];

    items.push({
      id: `g-${i + 1}`,
      title: titlePool[i % titlePool.length],
      date: dateFromOffset(start, i % 70),
      time: timesFor(i),
      city: CITIES[i % CITIES.length],
      miles: 4 + ((i * 7) % 48),
      tags: tagPool[i % tagPool.length],
      description: DESCRIPTIONS[type],
      host: host.name,
      verified: host.verified,
      type,
      image: IMAGES[i % IMAGES.length],
    });
  }

  return items;
}

export const GATHERINGS: Gathering[] = [...FEATURED, ...generatedGatherings()];

export function typeCounts(items: Gathering[]) {
  return GATHERING_TYPES.reduce(
    (acc, type) => {
      acc[type.id] = items.filter((item) => item.type === type.id).length;
      return acc;
    },
    {} as Record<GatheringTypeId, number>
  );
}

export function filterGatherings(
  items: Gathering[],
  {
    query,
    tab,
    types,
    distance,
  }: {
    query: string;
    tab: GatheringTabId;
    types: GatheringTypeId[];
    distance: DistanceFilter;
  }
) {
  const needle = query.trim().toLowerCase();

  return items.filter((item) => {
    if (tab !== "all" && item.type !== tab) return false;
    if (!types.includes(item.type)) return false;
    if (
      distance !== "nationwide" &&
      item.miles != null &&
      item.miles > distance
    ) {
      return false;
    }
    if (!needle) return true;

    const haystack = [
      item.title,
      item.city,
      item.host,
      item.description,
      ...item.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(needle);
  });
}

export function sortGatherings(
  items: Gathering[],
  sort: "date" | "distance"
) {
  return [...items].sort((a, b) => {
    if (sort === "distance") return (a.miles ?? Number.POSITIVE_INFINITY) - (b.miles ?? Number.POSITIVE_INFINITY);
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });
}

export function groupGatherings(items: Gathering[]) {
  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + ((7 - now.getDay()) % 7));
  endOfWeek.setHours(23, 59, 59, 999);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  const groups: { label: string; items: Gathering[] }[] = [];
  const buckets = new Map<string, Gathering[]>();

  for (const item of items) {
    const date = new Date(`${item.date}T12:00:00`);
    let label = date.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });

    if (date <= endOfWeek) label = "This week";
    else if (date <= endOfMonth) label = "Later this month";

    const list = buckets.get(label) ?? [];
    list.push(item);
    buckets.set(label, list);
  }

  const order = ["This week", "Later this month"];
  for (const label of order) {
    const list = buckets.get(label);
    if (list?.length) groups.push({ label, items: list });
    buckets.delete(label);
  }

  for (const [label, list] of buckets) {
    groups.push({ label, items: list });
  }

  return groups;
}

export function formatCardDate(iso: string) {
  const date = new Date(`${iso}T12:00:00`);
  return {
    day: date.getDate().toString().padStart(2, "0"),
    month: date
      .toLocaleDateString("en-GB", { month: "short" })
      .toUpperCase(),
    weekday: date.toLocaleDateString("en-GB", { weekday: "short" }),
    long: date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
  };
}
