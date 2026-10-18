import { NextResponse } from "next/server";
import { readContactQuery } from "@/lib/contact-query";
import { getContactQueriesCollection } from "@/lib/mongodb";

export async function POST(request: Request) {
  const parsed = readContactQuery(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ message: parsed.error }, { status: 400 });

  const now = new Date();
  const queries = await getContactQueriesCollection();
  const inserted = await queries.insertOne({ ...parsed.fields, answered: false, created_at: now, updated_at: now });
  return NextResponse.json({ id: String(inserted.insertedId) }, { status: 201 });
}
