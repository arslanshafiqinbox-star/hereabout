import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getCommentRepliesCollection, getPlaceCommentsCollection, type CommentReplyDoc } from "@/lib/mongodb";

type ReplyInput = {
  comment_id?: string;
  user_type?: string;
  comment?: string;
  approval?: boolean;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function serialize(doc: CommentReplyDoc & { _id: ObjectId }) {
  return {
    id: String(doc._id),
    comment_id: doc.comment_id,
    user_type: doc.user_type,
    comment: doc.comment,
    approval: doc.approval,
    upcount: doc.upcount,
    downcount: doc.downcount,
  };
}

export async function GET(request: Request) {
  const commentId = new URL(request.url).searchParams.get("comment_id")?.trim() ?? "";
  if (!/^[a-f0-9]{24}$/i.test(commentId)) return jsonError("A comment id is required.", 400);
  const replies = await getCommentRepliesCollection();
  const docs = await replies.find({ comment_id: commentId }).sort({ created_at: 1 }).toArray();
  return NextResponse.json({ replies: docs.map((doc) => serialize({ ...doc, _id: doc._id! })) });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ReplyInput | null;
  const comment_id = text(body?.comment_id);
  const user_type = text(body?.user_type);
  const comment = text(body?.comment);
  const approval = body?.approval === true;
  if (!/^[a-f0-9]{24}$/i.test(comment_id)) return jsonError("A comment id is required.", 400);
  if (!user_type || !comment) return jsonError("User type and comment text are required.", 400);

  const comments = await getPlaceCommentsCollection();
  const parent = await comments.findOne({ _id: new ObjectId(comment_id) });
  if (!parent) return jsonError("That comment was not found.", 404);

  const doc: CommentReplyDoc = {
    comment_id,
    user_type,
    comment,
    approval,
    upcount: 0,
    downcount: 0,
    created_at: new Date(),
  };
  const replies = await getCommentRepliesCollection();
  const result = await replies.insertOne(doc);
  return NextResponse.json(serialize({ ...doc, _id: result.insertedId }), { status: 201 });
}
