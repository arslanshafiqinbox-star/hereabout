import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getSiteAdvertisementsCollection, type SiteAdvertisementSection } from "@/lib/mongodb";

type AdvertisementInput = {
  id?: string;
  provider?: string;
  title?: string;
  tagline?: string;
  action?: string;
  link?: string;
  date?: string;
  section?: string;
  kind?: string;
};

const sections: SiteAdvertisementSection[] = ["directory", "place-to-visit", "food-and-drink", "events"];

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function recordId(value: string) {
  return /^[a-f0-9]{24}$/i.test(value) ? new ObjectId(value) : null;
}

function readAdvertisement(body: AdvertisementInput | null) {
  const provider = text(body?.provider);
  const title = text(body?.title);
  const tagline = text(body?.tagline);
  const action = text(body?.action);
  const link = text(body?.link);
  const date = text(body?.date);
  const section = text(body?.section);
  const kind = body?.kind === "main" ? "main" : "ad";
  if (!provider || !title || !tagline || !action || !link) {
    return { error: "Provider, title, tagline, action, and link are required." };
  }
  if (!sections.includes(section as SiteAdvertisementSection)) {
    return { error: "Choose a section." };
  }
  return {
    advertisement: {
      provider,
      title,
      tagline,
      action,
      link,
      date,
      section: section as SiteAdvertisementSection,
      kind: kind as "main" | "ad",
      archived: false,
    },
  };
}

async function mainAlreadyActive(section: SiteAdvertisementSection, exceptId?: ObjectId) {
  const ads = await getSiteAdvertisementsCollection();
  const existing = await ads.findOne({
    section,
    kind: "main",
    archived: false,
    ...(exceptId ? { _id: { $ne: exceptId } } : {}),
  });
  return Boolean(existing);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const body = (await request.json().catch(() => null)) as AdvertisementInput | null;
  const parsed = readAdvertisement(body);
  if ("error" in parsed) return jsonError(parsed.error ?? "Could not save that advertisement.", 400);
  if (parsed.advertisement.kind === "main" && (await mainAlreadyActive(parsed.advertisement.section))) {
    return jsonError("Archive the current main sponsor before adding another.", 409);
  }
  const ads = await getSiteAdvertisementsCollection();
  const result = await ads.insertOne(parsed.advertisement);
  return NextResponse.json({ id: String(result.insertedId) }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const body = (await request.json().catch(() => null)) as AdvertisementInput | null;
  const id = recordId(text(body?.id));
  if (!id) return jsonError("A valid advertisement id is required.", 400);
  const parsed = readAdvertisement(body);
  if ("error" in parsed) return jsonError(parsed.error ?? "Could not save that advertisement.", 400);
  if (parsed.advertisement.kind === "main" && (await mainAlreadyActive(parsed.advertisement.section, id))) {
    return jsonError("Archive the current main sponsor before adding another.", 409);
  }
  const ads = await getSiteAdvertisementsCollection();
  const result = await ads.updateOne({ _id: id }, { $set: parsed.advertisement });
  if (result.matchedCount === 0) return jsonError("That advertisement was not found.", 404);
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const body = (await request.json().catch(() => null)) as { id?: string } | null;
  const id = recordId(text(body?.id));
  if (!id) return jsonError("A valid advertisement id is required.", 400);
  const ads = await getSiteAdvertisementsCollection();
  const result = await ads.updateOne({ _id: id, kind: "main" }, { $set: { archived: true } });
  if (result.matchedCount === 0) return jsonError("That main sponsor was not found.", 404);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Sign in required.", 401);
  const id = recordId(new URL(request.url).searchParams.get("id")?.trim() ?? "");
  if (!id) return jsonError("A valid advertisement id is required.", 400);
  const ads = await getSiteAdvertisementsCollection();
  const result = await ads.deleteOne({ _id: id });
  if (result.deletedCount === 0) return jsonError("That advertisement was not found.", 404);
  return NextResponse.json({ ok: true });
}
