import { toPublicJournal } from "@/lib/journal-posts";
import { getJournalCollection } from "@/lib/mongodb";

export async function listPublicJournals() {
  const collection = await getJournalCollection();
  const docs = await collection
    .find({})
    .sort({ date_posted: -1, created_at: -1 })
    .toArray();
  return docs.map(toPublicJournal);
}

export async function getPublicJournalBySlug(slug: string) {
  const collection = await getJournalCollection();
  const doc = await collection.findOne({ slug });
  return doc ? toPublicJournal(doc) : null;
}
