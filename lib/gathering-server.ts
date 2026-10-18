import { ObjectId } from "mongodb";
import { toPublicGathering, type PublicGathering } from "@/lib/gathering-posts";
import {
  GATHERING_TYPES,
  type Gathering,
  type GatheringTypeId,
} from "@/lib/gatherings";
import { getPostedGatheringsCollection, getUsersCollection } from "@/lib/mongodb";

export type PublicGatheringDetail = PublicGathering & {
  host: string;
  hostInitials: string;
  hostSince: number | null;
  verified: boolean;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "M"
  );
}

function plainText(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function gatheringTypeId(value: string): GatheringTypeId {
  return GATHERING_TYPES.some((item) => item.id === value)
    ? (value as GatheringTypeId)
    : GATHERING_TYPES[0].id;
}

function toDiscoverGathering(
  gathering: PublicGathering,
  host?: string
): Gathering {
  const when = new Date(gathering.datetime);
  const organisation = host?.trim();

  return {
    id: gathering.id,
    title: gathering.title,
    date: [
      when.getFullYear(),
      String(when.getMonth() + 1).padStart(2, "0"),
      String(when.getDate()).padStart(2, "0"),
    ].join("-"),
    time: when
      .toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/\s/g, "")
      .toLowerCase(),
    city: gathering.location,
    tags: [gathering.type, gathering.attendance].filter(Boolean),
    description: plainText(gathering.about).slice(0, 220),
    host: organisation || "Community-hosted",
    verified: Boolean(organisation),
    type: gatheringTypeId(gathering.type_id),
    image: gathering.gathering_photos[0] ?? "",
  };
}

export async function listPublicGatherings() {
  const [gatherings, users] = await Promise.all([
    getPostedGatheringsCollection(),
    getUsersCollection(),
  ]);
  const docs = await gatherings
    .find({ approval: true })
    .sort({ datetime: 1 })
    .toArray();
  const posters = docs.length
    ? await users
        .find({ _id: { $in: docs.map((doc) => doc.posted_by) } })
        .toArray()
    : [];
  const hostById = new Map(
    posters.map((user) => [
      String(user._id),
      user.businessName || user.name,
    ])
  );

  return docs.map((doc) =>
    toDiscoverGathering(
      toPublicGathering(doc),
      hostById.get(String(doc.posted_by))
    )
  );
}

export async function getPublicGatheringById(id: string) {
  if (!ObjectId.isValid(id)) return null;

  const [gatherings, users] = await Promise.all([
    getPostedGatheringsCollection(),
    getUsersCollection(),
  ]);
  const doc = await gatherings.findOne({
    _id: new ObjectId(id),
    approval: true,
  });
  if (!doc) return null;

  const poster = await users.findOne({ _id: doc.posted_by });
  const host = (poster?.businessName || poster?.name || "").trim();

  return {
    ...toPublicGathering(doc),
    host: host || "Community-hosted",
    hostInitials: initials(host || "Community-hosted"),
    hostSince: poster?.created_at ? poster.created_at.getFullYear() : null,
    verified: Boolean(poster?.businessName?.trim()),
  } satisfies PublicGatheringDetail;
}
