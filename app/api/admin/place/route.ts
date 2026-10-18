import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getAdminPlacesCollection,
  getDirectoryListCollection,
  type DirectoryListName,
  type PlaceScoreDoc,
} from "@/lib/mongodb";

type PlaceInput = {
  id?: string;
  name?: string;
  tagline?: string;
  type_id?: string;
  county_id?: string;
  region_id?: string;
  local_authority?: string;
  closest_station?: string;
  closest_station_location?: string;
  score?: Partial<PlaceScoreDoc>;
  our_take?: string;
  comment_to_be_displayed?: string;
  primary_des?: string;
  secondary_des?: string;
};

const scoreKeys = ["character", "food_drink", "walks", "getting_together", "value"] as const;

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function hasVisibleText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").trim().length > 0;
}

function readScore(value: unknown): PlaceScoreDoc | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const score = {} as PlaceScoreDoc;
  for (const key of scoreKeys) {
    const number = typeof source[key] === "number" ? source[key] : Number(source[key]);
    if (!Number.isFinite(number) || number < 0 || number > 5) return null;
    score[key] = Math.round(number * 10) / 10;
  }
  return score;
}

async function refExists(kind: DirectoryListName, id: string) {
  if (!id) return false;
  const rows = await getDirectoryListCollection(kind);
  return Boolean(await rows.findOne({ id }));
}

async function readPlace(body: PlaceInput | null) {
  const name = text(body?.name);
  const tagline = text(body?.tagline);
  const type_id = text(body?.type_id);
  const county_id = text(body?.county_id);
  const region_id = text(body?.region_id);
  const local_authority = text(body?.local_authority);
  const closest_station = text(body?.closest_station);
  const closest_station_location = text(body?.closest_station_location);
  const our_take = text(body?.our_take);
  const comment_to_be_displayed = text(body?.comment_to_be_displayed);
  const primary_des = text(body?.primary_des);
  const secondary_des = text(body?.secondary_des);
  const score = readScore(body?.score);
  if (
    !name ||
    !tagline ||
    !type_id ||
    !county_id ||
    !region_id ||
    !local_authority ||
    !closest_station ||
    !closest_station_location ||
    !our_take ||
    !comment_to_be_displayed ||
    !hasVisibleText(primary_des) ||
    !hasVisibleText(secondary_des) ||
    !score
  ) {
    return { error: "Every field is required, and each score must be from 0 to 5." };
  }
  if (!(await refExists("type", type_id))) return { error: "Choose a type that exists." };
  if (!(await refExists("county", county_id))) return { error: "Choose a county that exists." };
  if (!(await refExists("region", region_id))) return { error: "Choose a region that exists." };
  return {
    place: {
      name,
      tagline,
      type_id,
      county_id,
      region_id,
      local_authority,
      closest_station,
      closest_station_location,
      score,
      our_take,
      comment_to_be_displayed,
      primary_des,
      secondary_des,
    },
  };
}

function placeId(value: string) {
  return /^[a-f0-9]{24}$/i.test(value) ? new ObjectId(value) : null;
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const body = (await request.json().catch(() => null)) as PlaceInput | null;
  const parsed = await readPlace(body);
  if ("error" in parsed) return jsonError(parsed.error ?? "Could not save that place.", 400);
  const places = await getAdminPlacesCollection();
  const result = await places.insertOne({ ...parsed.place, featured: false });
  return NextResponse.json({ id: String(result.insertedId) }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const body = (await request.json().catch(() => null)) as PlaceInput | null;
  const id = placeId(text(body?.id));
  if (!id) return jsonError("A valid place id is required.", 400);
  const parsed = await readPlace(body);
  if ("error" in parsed) return jsonError(parsed.error ?? "Could not save that place.", 400);
  const places = await getAdminPlacesCollection();
  const result = await places.updateOne({ _id: id }, { $set: parsed.place });
  if (result.matchedCount === 0) return jsonError("That place was not found.", 404);
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const body = (await request.json().catch(() => null)) as { id?: string; featured?: boolean } | null;
  const id = placeId(text(body?.id));
  if (!id) return jsonError("A valid place id is required.", 400);
  if (typeof body?.featured !== "boolean") return jsonError("Featured must be true or false.", 400);
  const places = await getAdminPlacesCollection();
  const place = await places.findOne({ _id: id });
  if (!place) return jsonError("That place was not found.", 404);
  if (body.featured) {
    await places.updateMany({ _id: { $ne: id }, featured: true }, { $set: { featured: false } });
  }
  await places.updateOne({ _id: id }, { $set: { featured: body.featured } });
  return NextResponse.json({ id: String(id), featured: body.featured });
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const id = placeId(new URL(request.url).searchParams.get("id")?.trim() ?? "");
  if (!id) return jsonError("A valid place id is required.", 400);
  const places = await getAdminPlacesCollection();
  const result = await places.deleteOne({ _id: id });
  if (result.deletedCount === 0) return jsonError("That place was not found.", 404);
  return NextResponse.json({ ok: true });
}
