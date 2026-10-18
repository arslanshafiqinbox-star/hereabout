type JournalRecord = {
  _id?: { toString(): string };
  name: string;
  description: string;
  tags?: string[];
  about: string;
  date_posted?: Date;
  slug: string;
  created_at: Date;
  updated_at: Date;
};

export type PublicJournal = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  about: string;
  date_posted: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

export function toPublicJournal(doc: JournalRecord): PublicJournal {
  const posted = doc.date_posted ?? doc.created_at;
  return {
    id: String(doc._id),
    name: doc.name,
    description: doc.description,
    tags: doc.tags ?? [],
    about: doc.about,
    date_posted: posted.toISOString(),
    slug: doc.slug,
    created_at: doc.created_at.toISOString(),
    updated_at: doc.updated_at.toISOString(),
  };
}

export function formatPostedDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function slugifyJournalName(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "note";
}

export function parseJournalInput(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const about = String(body.about ?? "").trim();
  const aboutText = about
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .trim();

  const datePostedRaw = String(body.date_posted ?? "").trim();
  const date_posted = datePostedRaw
    ? new Date(`${datePostedRaw.slice(0, 10)}T12:00:00`)
    : new Date();
  if (Number.isNaN(date_posted.getTime())) {
    throw new Error("Enter a valid date posted.");
  }

  if (!name || !description || !aboutText) {
    throw new Error("Name, description, and about are required.");
  }

  const tags = Array.isArray(body.tags)
    ? body.tags.map((item) => String(item ?? "").trim()).filter(Boolean)
    : String(body.tags ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return {
    name,
    description,
    tags,
    about,
    date_posted,
    slug: slugifyJournalName(name),
  };
}
