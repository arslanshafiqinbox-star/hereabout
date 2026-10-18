import { ObjectId } from "mongodb";
import { GATHERING_TYPES } from "@/lib/gatherings";
import type { GatheringDoc, GatheringSpeaker } from "@/lib/mongodb";

export type PublicGathering = {
  id: string;
  posted_by: string;
  title: string;
  type: string;
  type_id: string;
  datetime: string;
  location: string;
  location_link: string;
  booking: string;
  attendance: string;
  about: string;
  gathering_photos: string[];
  speakers: GatheringSpeaker[];
  approval: boolean;
  extras: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export function toPublicGathering(doc: GatheringDoc): PublicGathering {
  return {
    id: String(doc._id),
    posted_by: String(doc.posted_by),
    title: doc.title,
    type: doc.type,
    type_id: doc.type_id,
    datetime: doc.datetime.toISOString(),
    location: doc.location,
    location_link: doc.location_link,
    booking: doc.booking,
    attendance: doc.attendance,
    about: doc.about,
    gathering_photos: doc.gathering_photos ?? [],
    speakers: doc.speakers ?? [],
    approval: Boolean(doc.approval),
    extras: doc.extras ?? {},
    created_at: doc.created_at.toISOString(),
    updated_at: doc.updated_at.toISOString(),
  };
}

export function parseExtras(value: unknown): Record<string, unknown> {
  if (value == null || value === "") return {};
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return {};
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Extras must be a JSON object.");
    }
    return parsed as Record<string, unknown>;
  }
  throw new Error("Extras must be a JSON object.");
}

export function parseGatheringInput(body: Record<string, unknown>) {
  const title = String(body.title ?? "").trim();
  const type_id = String(body.type_id ?? "").trim();
  const typeMeta = GATHERING_TYPES.find((item) => item.id === type_id);
  const type = String(body.type ?? typeMeta?.label ?? "").trim();
  const datetimeRaw = String(body.datetime ?? "").trim();
  const location = String(body.location ?? "").trim();
  const location_link = String(body.location_link ?? "").trim();
  const booking = String(body.booking ?? "").trim();
  const attendance = String(body.attendance ?? "").trim();
  const about = String(body.about ?? "").trim();
  const aboutText = about
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .trim();

  if (!title || !type_id || !type || !datetimeRaw || !location || !aboutText) {
    throw new Error("Title, type, date/time, location, and about are required.");
  }

  const datetime = new Date(datetimeRaw);
  if (Number.isNaN(datetime.getTime())) {
    throw new Error("Enter a valid date and time.");
  }

  const gathering_photos = Array.isArray(body.gathering_photos)
    ? body.gathering_photos
        .map((item) => String(item ?? "").trim())
        .filter(Boolean)
    : [];

  const speakers = Array.isArray(body.speakers)
    ? body.speakers
        .map((item) => {
          const row = item as { speaker_name?: string; role?: string };
          return {
            speaker_name: String(row.speaker_name ?? "").trim(),
            role: String(row.role ?? "").trim(),
          };
        })
        .filter((row) => row.speaker_name)
    : [];

  return {
    title,
    type,
    type_id,
    datetime,
    location,
    location_link,
    booking,
    attendance,
    about,
    gathering_photos,
    speakers,
    extras: parseExtras(body.extras),
  };
}

export function ownerId(userId: string) {
  return new ObjectId(userId);
}
