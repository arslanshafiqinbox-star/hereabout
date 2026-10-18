import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import {
  getAdminPlacesCollection,
  commentOverall,
  getCommentRepliesCollection,
  getPlaceCommentsCollection,
  type CommentRatingsDoc,
  type PlaceCommentDoc,
} from "@/lib/mongodb";

type CommentInput = {
  user_type?: string;
  comment?: string;
  place_id?: string;
  approval?: boolean;
  ratings?: Partial<CommentRatingsDoc>;
};

const ratingKeys = ["character", "food_drink", "walks", "getting_around", "value"] as const;

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readRatings(value: unknown): CommentRatingsDoc | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const ratings = {} as CommentRatingsDoc;
  for (const key of ratingKeys) {
    const number = typeof source[key] === "number" ? source[key] : Number(source[key]);
    if (!Number.isFinite(number) || number < 1 || number > 5) return null;
    ratings[key] = Math.round(number * 10) / 10;
  }
  return ratings;
}

function serialize(doc: PlaceCommentDoc & { _id: ObjectId }) {
  return {
    id: String(doc._id),
    user_type: doc.user_type,
    ratings: doc.ratings,
    overall: doc.overall ?? commentOverall(doc.ratings),
    comment: doc.comment,
    place_id: doc.place_id,
    approval: doc.approval === true,
    upcount: doc.upcount,
    downcount: doc.downcount,
  };
}

export async function GET(request: Request) {
  const placeId = new URL(request.url).searchParams.get("place_id")?.trim() ?? "";
  if (!/^[a-f0-9]{24}$/i.test(placeId)) return jsonError("A place id is required.", 400);
  const comments = await getPlaceCommentsCollection();
  const docs = await comments.find({ place_id: placeId }).sort({ created_at: -1 }).toArray();
  const replies = await getCommentRepliesCollection();
  const replyDocs = await replies
    .find({ comment_id: { $in: docs.map((doc) => String(doc._id)) } })
    .sort({ created_at: 1 })
    .toArray();
  const rows = docs.map((doc) => ({
    ...serialize({ ...doc, _id: doc._id! }),
    replies: replyDocs
      .filter((reply) => reply.comment_id === String(doc._id))
      .map((reply) => ({
        id: String(reply._id),
        comment_id: reply.comment_id,
        user_type: reply.user_type,
        comment: reply.comment,
        approval: reply.approval,
        upcount: reply.upcount,
        downcount: reply.downcount,
      })),
  }));
  const overall =
    rows.length === 0
      ? null
      : Math.round((rows.reduce((sum, row) => sum + row.overall, 0) / rows.length) * 10) / 10;
  return NextResponse.json({ overall, comments: rows });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CommentInput | null;
  const user_type = text(body?.user_type);
  const comment = text(body?.comment);
  const place_id = text(body?.place_id);
  const ratings = readRatings(body?.ratings);
  if (!user_type || !comment || !place_id || !ratings) {
    return jsonError("User type, comment, place id, and all five ratings from 1 to 5 are required.", 400);
  }
  if (!/^[a-f0-9]{24}$/i.test(place_id)) return jsonError("Choose a place that exists.", 400);
  const places = await getAdminPlacesCollection();
  const place = await places.findOne({ _id: new ObjectId(place_id) });
  if (!place) return jsonError("Choose a place that exists.", 404);

  const comments = await getPlaceCommentsCollection();
  const doc: PlaceCommentDoc = {
    user_type,
    ratings,
    overall: commentOverall(ratings),
    comment,
    place_id,
    approval: body?.approval === true,
    upcount: 0,
    downcount: 0,
    created_at: new Date(),
  };
  const result = await comments.insertOne(doc);
  return NextResponse.json(serialize({ ...doc, _id: result.insertedId }), { status: 201 });
}
