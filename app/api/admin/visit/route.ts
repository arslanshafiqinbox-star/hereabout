import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getAdminPlacesCollection, getDirectoryListCollection, getPlaceVisitsCollection } from "@/lib/mongodb";

type VisitInput = {
  id?: string;
  name?: string;
  location?: string;
  tagline?: string;
  place_id?: string;
  county?: string;
  activity?: string;
  time?: string;
  cost?: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function visitId(value: string) {
  return /^[a-f0-9]{24}$/i.test(value) ? new ObjectId(value) : null;
}

async function readVisit(body: VisitInput | null) {
  const name = text(body?.name);
  const location = text(body?.location);
  const tagline = text(body?.tagline);
  const place_id = text(body?.place_id);
  const activity = text(body?.activity);
  const time = text(body?.time);
  const cost = text(body?.cost);
  if (!name || !location || !tagline || !place_id || !activity || !time || !cost) {
    return { error: "Every field is required." };
  }
  if (!visitId(place_id)) return { error: "Choose a place that exists." };
  const places = await getAdminPlacesCollection();
  const place = await places.findOne({ _id: new ObjectId(place_id) });
  if (!place) return { error: "Choose a place that exists." };
  const counties = await getDirectoryListCollection("county");
  const county = await counties.findOne({ id: place.county_id });
  if (!county) return { error: "This place has no county." };
  return { visit: { name, location, tagline, place_id, county: county.name, activity, time, cost } };
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const body = (await request.json().catch(() => null)) as VisitInput | null;
  const parsed = await readVisit(body);
  if ("error" in parsed) return jsonError(parsed.error, 400);
  const visits = await getPlaceVisitsCollection();
  const result = await visits.insertOne(parsed.visit);
  return NextResponse.json({ id: String(result.insertedId) }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const body = (await request.json().catch(() => null)) as VisitInput | null;
  const id = visitId(text(body?.id));
  if (!id) return jsonError("A valid visit id is required.", 400);
  const parsed = await readVisit(body);
  if ("error" in parsed) return jsonError(parsed.error, 400);
  const visits = await getPlaceVisitsCollection();
  const result = await visits.updateOne({ _id: id }, { $set: parsed.visit });
  if (result.matchedCount === 0) return jsonError("That visit was not found.", 404);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const id = visitId(new URL(request.url).searchParams.get("id")?.trim() ?? "");
  if (!id) return jsonError("A valid visit id is required.", 400);
  const visits = await getPlaceVisitsCollection();
  const result = await visits.deleteOne({ _id: id });
  if (result.deletedCount === 0) return jsonError("That visit was not found.", 404);
  return NextResponse.json({ ok: true });
}
