import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { placeSlug } from "@/lib/places";
import {
  getDirectoryListCollection,
  type DirectoryListDoc,
  type DirectoryListName,
} from "@/lib/mongodb";

type EntityInput = {
  id?: string;
  previousId?: string;
  name?: string;
  description?: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function serialize(doc: DirectoryListDoc) {
  return {
    id: doc.id,
    name: doc.name,
    description: doc.description,
  };
}

function readFields(body: EntityInput) {
  return {
    name: body.name?.trim() ?? "",
    description: body.description?.trim() ?? "",
  };
}

async function nextId(kind: DirectoryListName, name: string) {
  const col = await getDirectoryListCollection(kind);
  const base = placeSlug(name) || "item";
  let id = base;
  let suffix = 2;
  while (await col.findOne({ id })) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

export function createAdminEntityRoutes(kind: DirectoryListName) {
  async function GET() {
    const session = await getAdminSession();
    if (!session) return jsonError("Sign in required.", 401);
    const col = await getDirectoryListCollection(kind);
    const docs = await col.find({}).sort({ name: 1 }).toArray();
    return NextResponse.json({ rows: docs.map(serialize) });
  }

  async function POST(request: Request) {
    const session = await getAdminSession();
    if (!session) return jsonError("Sign in required.", 401);
    const body = (await request.json().catch(() => null)) as EntityInput | null;
    const fields = readFields(body ?? {});
    if (!fields.name || !fields.description) {
      return jsonError("Name and description are required.", 400);
    }

    const col = await getDirectoryListCollection(kind);
    const row = { ...fields, id: await nextId(kind, fields.name) };
    await col.insertOne(row);
    return NextResponse.json({ row }, { status: 201 });
  }

  async function PUT(request: Request) {
    const session = await getAdminSession();
    if (!session) return jsonError("Sign in required.", 401);
    const body = (await request.json().catch(() => null)) as EntityInput | null;
    const fields = readFields(body ?? {});
    const previousId = body?.previousId?.trim() ?? "";
    if (!previousId || !fields.name || !fields.description) {
      return jsonError("Name and description are required.", 400);
    }

    const col = await getDirectoryListCollection(kind);
    const current = await col.findOne({ id: previousId });
    if (!current) return jsonError("That row was not found.", 404);
    await col.updateOne({ id: previousId }, { $set: fields });
    return NextResponse.json({ row: { ...fields, id: current.id } });
  }

  async function DELETE(request: Request) {
    const session = await getAdminSession();
    if (!session) return jsonError("Sign in required.", 401);
    const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
    if (!id) return jsonError("Id is required.", 400);
    const col = await getDirectoryListCollection(kind);
    const result = await col.deleteOne({ id });
    if (result.deletedCount === 0) return jsonError("That row was not found.", 404);
    return NextResponse.json({ ok: true });
  }

  return { GET, POST, PUT, DELETE };
}
