import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { queryKind, readContactQuery, readQueryKind, type QueryKind } from "@/lib/contact-query";
import { getContactQueriesCollection } from "@/lib/mongodb";

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function readId(value: unknown) {
  const id = typeof value === "string" ? value.trim() : "";
  return /^[a-f0-9]{24}$/i.test(id) ? id : "";
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const kind = new URL(request.url).searchParams.get("kind");
  const queries = await getContactQueriesCollection();
  const docs = await queries.find({}).sort({ created_at: -1 }).toArray();
  const visible = kind === "contact" || kind === "advertise" ? docs.filter((doc) => queryKind(doc) === kind) : docs;
  return NextResponse.json({
    queries: visible.map((doc) => ({
      id: String(doc._id),
      kind: queryKind(doc),
      business_name: doc.business_name,
      your_name: doc.your_name ?? "",
      business_email: doc.business_email,
      business_type: doc.business_type ?? "",
      place: doc.place ?? "",
      subject: doc.subject,
      message: doc.message,
      answered: doc.answered === true,
      created_at: new Date(doc.created_at).toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const body = await request.json().catch(() => null);
  const parsed = readContactQuery(body);
  if ("error" in parsed) return jsonError(parsed.error, 400);

  const now = new Date();
  const queries = await getContactQueriesCollection();
  const inserted = await queries.insertOne({
    ...parsed.fields,
    kind: readQueryKind(body),
    answered: body?.answered === true,
    created_at: now,
    updated_at: now,
  });
  return NextResponse.json({ id: String(inserted.insertedId) }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const body = (await request.json().catch(() => null)) as {
    id?: string;
    answered?: boolean;
    kind?: QueryKind;
    your_name?: string;
    business_type?: string;
    place?: string;
  } | null;
  const id = readId(body?.id);
  const parsed = readContactQuery(body);
  if (!id) return jsonError("A valid id is required.", 400);
  if ("error" in parsed) return jsonError(parsed.error, 400);

  const queries = await getContactQueriesCollection();
  const updated = await queries.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        business_name: parsed.fields.business_name,
        business_email: parsed.fields.business_email,
        subject: parsed.fields.subject,
        message: parsed.fields.message,
        ...(body && "your_name" in body ? { your_name: parsed.fields.your_name } : {}),
        ...(body && "business_type" in body ? { business_type: parsed.fields.business_type } : {}),
        ...(body && "place" in body ? { place: parsed.fields.place } : {}),
        ...(body?.kind === "contact" || body?.kind === "advertise" ? { kind: body.kind } : {}),
        answered: body?.answered === true,
        updated_at: new Date(),
      },
    },
    { returnDocument: "after" },
  );
  if (!updated) return jsonError("That query was not found.", 404);
  return NextResponse.json({ id });
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const id = readId(new URL(request.url).searchParams.get("id"));
  if (!id) return jsonError("A valid id is required.", 400);
  const queries = await getContactQueriesCollection();
  const result = await queries.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) return jsonError("That query was not found.", 404);
  return NextResponse.json({ ok: true });
}
