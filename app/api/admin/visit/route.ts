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
  article?: string;
  best_time?: string;
  go_if?: string[];
  skip_if?: string[];
  video?: string;
  closest_station?: string;
  closest_station_location?: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function lines(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 12)
    .map((item) => item.slice(0, 180));
}

function hasVisibleText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").trim().length > 0;
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
  const article = text(body?.article);
  const best_time = text(body?.best_time);
  const go_if = lines(body?.go_if);
  const skip_if = lines(body?.skip_if);
  const video = text(body?.video);
  const closest_station = text(body?.closest_station);
  const closest_station_location = text(body?.closest_station_location);
  if (!name || !location || !tagline || !place_id || !activity || !time || !cost || !hasVisibleText(article)) {
    return { error: "Name, location, tagline, activity, time, cost, and article are required." };
  }
  if (!best_time || !closest_station || !closest_station_location) {
    return { error: "Best time, closest station, and station location are required." };
  }
  if (go_if.length === 0 || skip_if.length === 0) {
    return { error: "Add at least one go-if line and one skip-if line." };
  }
  if (article.length > 20000) return { error: "The article is too long." };
  if (!visitId(place_id)) return { error: "Choose a place that exists." };
  const places = await getAdminPlacesCollection();
  const place = await places.findOne({ _id: new ObjectId(place_id) });
  if (!place) return { error: "Choose a place that exists." };
  const counties = await getDirectoryListCollection("county");
  const county = await counties.findOne({ id: place.county_id });
  if (!county) return { error: "This place has no county." };
  return {
    visit: {
      name,
      location,
      tagline,
      place_id,
      county: county.name,
      activity,
      time,
      cost,
      article,
      best_time,
      go_if,
      skip_if,
      video,
      closest_station,
      closest_station_location,
    },
  };
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const body = (await request.json().catch(() => null)) as VisitInput | null;
  const parsed = await readVisit(body);
  if ("error" in parsed) return jsonError(parsed.error ?? "Could not save that visit.", 400);
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
  if ("error" in parsed) return jsonError(parsed.error ?? "Could not save that visit.", 400);
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
