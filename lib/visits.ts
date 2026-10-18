import { placeSlug, places } from "@/lib/places";

export type Visit = {
  title: string;
  text: string;
  kind: string;
  time: string;
  price: string;
  tags: string[];
};

export type VisitAd = {
  after: string;
  category: string;
  title: string;
  text: string;
  action: string;
  tags: string[];
};

const alnmouth: Visit[] = [
  {
    title: "Alnmouth beach and dunes",
    text: "A long sandy beach backed by dunes.",
    kind: "Beach",
    time: "1–2 hours",
    price: "Free",
    tags: ["Walks", "Family", "Free"],
  },
  {
    title: "The coast walk to Warkworth",
    text: "A coastal walk north to a castle at the end.",
    kind: "Walk",
    time: "3 hours",
    price: "Free",
    tags: ["Walks", "Free"],
  },
  {
    title: "Alnwick Castle",
    text: "A big castle a short bus ride or drive inland.",
    kind: "Castle",
    time: "Half a day",
    price: "Paid",
    tags: ["History", "Family"],
  },
  {
    title: "The Alnwick Garden",
    text: "A large garden beside the castle.",
    kind: "Garden",
    time: "Half a day",
    price: "Paid",
    tags: ["Family"],
  },
];

const bakewell: Visit[] = [
  {
    title: "The Monsal Trail",
    text: "A flat trail along a former railway, through tunnels and over a viaduct.",
    kind: "Walk or cycle",
    time: "2–4 hours",
    price: "Free",
    tags: ["Walks", "Free", "Family"],
  },
  {
    title: "Haddon Hall",
    text: "A very well-preserved medieval manor house just outside town.",
    kind: "Historic house",
    time: "2 hours",
    price: "Paid",
    tags: ["History"],
  },
  {
    title: "Bakewell Old Bridge",
    text: "A medieval stone bridge over the Wye. Feed the ducks, argue about pudding.",
    kind: "History",
    time: "15 minutes",
    price: "Free",
    tags: ["History", "Free"],
  },
  {
    title: "All Saints' Church",
    text: "A hilltop church with old carved crosses in the churchyard.",
    kind: "Church",
    time: "30 minutes",
    price: "Free",
    tags: ["History", "Free"],
  },
];

const whitby: Visit[] = [
  {
    title: "The 199 steps",
    text: "The famous climb from the old town, with views back over the roofs.",
    kind: "Walk",
    time: "20 minutes",
    price: "Free",
    tags: ["Walks", "History", "Free"],
  },
];

const visitsByPlace: Record<string, Visit[]> = {
  Alnmouth: alnmouth,
  Bakewell: bakewell,
  Whitby: whitby,
};

const adsByPlace: Record<string, VisitAd[]> = {
  Alnmouth: [
    {
      after: "Alnwick Castle",
      category: "Workshop",
      title: "Clay & Kiln Studio",
      text: "Half-day pottery workshops for beginners. No experience needed.",
      action: "Book a place",
      tags: ["Family"],
    },
  ],
  Bakewell: [
    {
      after: "Bakewell Old Bridge",
      category: "Museum",
      title: "The Curiosity Museum",
      text: "Two floors of oddities, old maps and local history. Open daily.",
      action: "Plan your visit",
      tags: [],
    },
  ],
};

export type ListedVisit = Visit & {
  placeName: string;
  county: string;
  id?: string;
  placeId?: string;
  mapUrl?: string;
};

export function visitsFor(placeName: string): Visit[] {
  return visitsByPlace[placeName] ?? [];
}

export function allVisits(): ListedVisit[] {
  return Object.entries(visitsByPlace)
    .flatMap(([placeName, list]) => {
      const county = places.find((place) => place.name === placeName)?.county ?? "";
      return list.map((visit) => ({ ...visit, placeName, county }));
    })
    .sort((a, b) => a.title.localeCompare(b.title, "en"));
}

export function visitAdsFor(placeName: string): VisitAd[] {
  return adsByPlace[placeName] ?? [];
}

export function findVisit(placeName: string, visitId: string) {
  return visitsFor(placeName).find((visit) => placeSlug(visit.title) === visitId) ?? null;
}
