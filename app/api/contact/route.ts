import { NextResponse } from "next/server";
import { readContactQuery, readQueryKind } from "@/lib/contact-query";
import { getContactQueriesCollection } from "@/lib/mongodb";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = readContactQuery(body);
  if ("error" in parsed) return NextResponse.json({ message: parsed.error }, { status: 400 });

  const now = new Date();
  const consent = Boolean(body && typeof body === "object" && (body as { consent?: unknown }).consent === true);
  const queries = await getContactQueriesCollection();
  const inserted = await queries.insertOne({
    ...parsed.fields,
    kind: readQueryKind(body),
    consent,
    answered: false,
    created_at: now,
    updated_at: now,
  });
  return NextResponse.json({ id: String(inserted.insertedId) }, { status: 201 });
}
