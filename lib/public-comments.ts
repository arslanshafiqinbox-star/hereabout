import { commentOverall, getCommentRepliesCollection, getPlaceCommentsCollection } from "@/lib/mongodb";

export type PublicReply = {
  id: string;
  comment_id: string;
  user_type: string;
  comment: string;
  approval: boolean;
  upcount: number;
  downcount: number;
  created_at: string;
};

export type PublicComment = {
  id: string;
  user_type: string;
  ratings: {
    character: number;
    food_drink: number;
    walks: number;
    getting_around: number;
    value: number;
  };
  overall: number;
  comment: string;
  place_id: string;
  approval: boolean;
  upcount: number;
  downcount: number;
  created_at: string;
  replies: PublicReply[];
};

export async function listCommentThreads(): Promise<PublicComment[]> {
  const comments = await getPlaceCommentsCollection();
  const docs = await comments.find({ approval: true }).sort({ created_at: -1 }).toArray();
  const replies = await getCommentRepliesCollection();
  const replyDocs = await replies
    .find({ comment_id: { $in: docs.map((doc) => String(doc._id)) }, approval: true })
    .sort({ created_at: 1 })
    .toArray();

  return docs.map((doc) => ({
    id: String(doc._id),
    user_type: doc.user_type,
    ratings: doc.ratings,
    overall: doc.overall ?? commentOverall(doc.ratings),
    comment: doc.comment,
    place_id: doc.place_id,
    approval: doc.approval === true,
    upcount: doc.upcount,
    downcount: doc.downcount,
    created_at: new Date(doc.created_at).toISOString(),
    replies: replyDocs
      .filter((reply) => reply.comment_id === String(doc._id))
      .map((reply) => ({
        id: String(reply._id),
        comment_id: reply.comment_id,
        user_type: reply.user_type,
        comment: reply.comment,
        approval: reply.approval === true,
        upcount: reply.upcount,
        downcount: reply.downcount,
        created_at: new Date(reply.created_at).toISOString(),
      })),
  }));
}
