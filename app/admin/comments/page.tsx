import { redirect } from "next/navigation";
import { CommentModeration, type ModerationComment, type ModerationReply } from "@/components/admin/CommentModeration";
import { getAdminSession } from "@/lib/admin-auth";
import {
  commentOverall,
  getAdminPlacesCollection,
  getCommentRepliesCollection,
  getPlaceCommentsCollection,
} from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const [commentsCollection, repliesCollection, placesCollection] = await Promise.all([
    getPlaceCommentsCollection(),
    getCommentRepliesCollection(),
    getAdminPlacesCollection(),
  ]);
  const [docs, places] = await Promise.all([
    commentsCollection.find({}).sort({ created_at: -1 }).toArray(),
    placesCollection.find({}, { projection: { name: 1 } }).toArray(),
  ]);
  const placeName = new Map(places.map((place) => [String(place._id), place.name]));
  const replies = await repliesCollection
    .find({ comment_id: { $in: docs.map((doc) => String(doc._id)) } })
    .sort({ created_at: 1 })
    .toArray();

  const comments: ModerationComment[] = docs.map((doc) => ({
    id: String(doc._id),
    userType: doc.user_type,
    comment: doc.comment,
    placeName: placeName.get(doc.place_id) ?? "Place",
    overall: doc.overall ?? commentOverall(doc.ratings),
    upcount: doc.upcount,
    downcount: doc.downcount,
    approval: doc.approval === true,
  }));
  const replyRows: ModerationReply[] = replies.map((reply) => ({
    id: String(reply._id),
    commentId: reply.comment_id,
    userType: reply.user_type,
    comment: reply.comment,
    upcount: reply.upcount,
    downcount: reply.downcount,
    approval: reply.approval === true,
  }));

  return <CommentModeration comments={comments} replies={replyRows} />;
}
