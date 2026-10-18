export type JournalArticle = {
  slug: string;
  category: string;
  minutes: number;
  title: string;
  excerpt: string;
  body: string[];
};

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    slug: "communities-keeping-mawlid-alive",
    category: "Field notes",
    minutes: 7,
    title: "The communities keeping Mawlid alive",
    excerpt:
      "In terraced houses and rented halls, a quiet network of hosts has kept the tradition of gathering alive for generations.",
    body: [
      "In terraced houses and rented halls, a quiet network of hosts has kept the tradition of gathering alive for generations.",
      "What looks informal from the street is often the work of the same families, year after year: borrowing chairs, boiling tea, and making space for neighbours who would not otherwise have a place to sit together.",
      "This note is a first look at those rooms — how they are found, how they are kept, and why they still matter.",
    ],
  },
  {
    slug: "guide-to-your-first-sufi-retreat",
    category: "Guide",
    minutes: 6,
    title: "A guide to finding your first Sufi retreat",
    excerpt:
      "What to expect, what to bring, and how to choose between the dozens of programmes now listed each season.",
    body: [
      "What to expect, what to bring, and how to choose between the dozens of programmes now listed each season.",
      "A first retreat can feel opaque: silent mornings, shared meals, and a timetable that asks you to leave the phone downstairs.",
      "This guide sets out the practical questions — length, lodging, and tone — so you can choose a programme that fits, rather than the one that simply has a spare bed.",
    ],
  },
  {
    slug: "mawlid-gatherings-across-the-uk-this-month",
    category: "This month",
    minutes: 4,
    title: "Mawlid gatherings happening across the UK this month",
    excerpt:
      "A short round-up of what's on, by city, for anyone planning their month ahead.",
    body: [
      "A short round-up of what's on, by city, for anyone planning their month ahead.",
      "From Cardiff to Glasgow, hosts are opening rooms for praise, poetry, and an evening meal. Some are ticketed; many are not.",
      "Use this as a starting map, then confirm times with the host — rooms fill, and some gatherings move at short notice.",
    ],
  },
  {
    slug: "what-hosts-wish-guests-knew",
    category: "Field notes",
    minutes: 5,
    title: "What hosts wish guests knew",
    excerpt:
      "Arrive a little early, take your shoes off without being asked, and stay for the tea. The rest is courtesy.",
    body: [
      "Arrive a little early, take your shoes off without being asked, and stay for the tea. The rest is courtesy.",
      "Hosts spend the afternoon setting chairs and the evening washing cups. A guest who helps stack, or who simply stays until the room is quiet, is remembered.",
      "These are small notes from people who open their houses each month — offered so a first visit feels less like entering someone else's ritual, and more like joining it.",
    ],
  },
  {
    slug: "how-to-sit-in-a-dhikr-circle",
    category: "Guide",
    minutes: 5,
    title: "How to sit in a dhikr circle for the first time",
    excerpt:
      "You do not need to know the words. You need a place to sit, and the patience to let the room teach you the pace.",
    body: [
      "You do not need to know the words. You need a place to sit, and the patience to let the room teach you the pace.",
      "Follow the person beside you. If you lose the line, be still. Most circles would rather you listen well than sing over the grain of the gathering.",
      "Leave when the closing prayer is done, not in the middle of a round — unless you must, in which case go quietly.",
    ],
  },
  {
    slug: "study-circles-worth-travelling-for",
    category: "This month",
    minutes: 6,
    title: "Study circles worth travelling for",
    excerpt:
      "A handful of rooms this season where the reading is slow, the questions are allowed, and nobody is performing.",
    body: [
      "A handful of rooms this season where the reading is slow, the questions are allowed, and nobody is performing.",
      "Some meet above shops. One meets in a borrowed classroom after hours. The best of them send the page in advance and keep the evening short.",
      "If you can only go once, go where they still leave time for tea after the last question.",
    ],
  },
  {
    slug: "on-bringing-children-to-a-gathering",
    category: "Guide",
    minutes: 4,
    title: "On bringing children to a gathering",
    excerpt:
      "The rooms that last are the ones that expect a child to move, and have already put a basket of books by the door.",
    body: [
      "The rooms that last are the ones that expect a child to move, and have already put a basket of books by the door.",
      "Ask the host before you come. Some evenings are built for it; some are not, and that is not a failing.",
      "Bring a snack you would be happy to share, and sit near the edge so leaving for a moment does not become a procession.",
    ],
  },
  {
    slug: "letters-from-a-rented-hall",
    category: "Field notes",
    minutes: 8,
    title: "Letters from a rented hall",
    excerpt:
      "A winter of folding chairs, a leaking urn, and the same twelve people who kept coming back until the room felt like a house.",
    body: [
      "A winter of folding chairs, a leaking urn, and the same twelve people who kept coming back until the room felt like a house.",
      "Nobody owned the hall. They booked it by the hour and left it cleaner than they found it. That was the rule, and it held.",
      "These letters are from that season — not a manifesto, just a record of how a gathering becomes a habit.",
    ],
  },
  {
    slug: "retreats-that-do-not-advertise",
    category: "Guide",
    minutes: 7,
    title: "Retreats that do not advertise",
    excerpt:
      "Some programmes still travel by word of mouth. Here is how people find them, and what to ask before you book.",
    body: [
      "Some programmes still travel by word of mouth. Here is how people find them, and what to ask before you book.",
      "Ask who cooks, who teaches, and whether silence is requested or merely hoped for. The answers tell you more than the leaflet.",
      "If nobody can name last season's guests, wait. A retreat that cannot remember its own room is not yet a place to rest.",
    ],
  },
];

export function getJournalArticle(slug: string) {
  return JOURNAL_ARTICLES.find((article) => article.slug === slug);
}
