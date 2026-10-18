import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getAdminPlacesCollection, getPlaceAdvertisementsCollection } from "@/lib/mongodb";

type AdvertisementInput = {
  id?: string;
  provider?: string;
  title?: string;
  tagline?: string;
  action?: string;
  link?: string;
  date?: string;
  section?: string;
  place_id?: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

const sections = ["hero", "between-of-places", "eat-drink", "events"] as const;

function recordId(value: string) {
  return /^[a-f0-9]{24}$/i.test(value) ? new ObjectId(value) : null;
}

async function readAdvertisement(body: AdvertisementInput | null) {
  const provider = text(body?.provider);
  const title = text(body?.title);
  const tagline = text(body?.tagline);
  const action = text(body?.action);
  const link = text(body?.link);
  const date = text(body?.date);
  const section = text(body?.section);
  const place_id = text(body?.place_id);
  if (!provider || !title || !tagline || !action || !link || !place_id) {
    return { error: "Every field is required." };
  }
  if (!sections.includes(section as (typeof sections)[number])) {
    return { error: "Choose a section." };
  }
  if (!recordId(place_id)) return { error: "Choose a place that exists." };
  const places = await getAdminPlacesCollection();
  const place = await places.findOne({ _id: new ObjectId(place_id) });
  if (!place) return { error: "Choose a place that exists." };
  return { advertisement: { provider, title, tagline, action, link, date, section, place_id } };
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const body = (await request.json().catch(() => null)) as AdvertisementInput | null;
  const parsed = await readAdvertisement(body);
  if ("error" in parsed) return jsonError(parsed.error, 400);
  const ads = await getPlaceAdvertisementsCollection();
  const result = await ads.insertOne(parsed.advertisement);
  return NextResponse.json({ id: String(result.insertedId) }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const body = (await request.json().catch(() => null)) as AdvertisementInput | null;
  const id = recordId(text(body?.id));
  if (!id) return jsonError("A valid advertisement id is required.", 400);
  const parsed = await readAdvertisement(body);
  if ("error" in parsed) return jsonError(parsed.error, 400);
  const ads = await getPlaceAdvertisementsCollection();
  const result = await ads.updateOne({ _id: id }, { $set: parsed.advertisement });
  if (result.matchedCount === 0) return jsonError("That advertisement was not found.", 404);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const id = recordId(new URL(request.url).searchParams.get("id")?.trim() ?? "");
  if (!id) return jsonError("A valid advertisement id is required.", 400);
  const ads = await getPlaceAdvertisementsCollection();
  const result = await ads.deleteOne({ _id: id });
  if (result.deletedCount === 0) return jsonError("That advertisement was not found.", 404);
  return NextResponse.json({ ok: true });
}
