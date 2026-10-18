import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PlaceCommentBoard, type PlaceCommentThread } from "@/components/admin/PlaceCommentBoard";
import { PlaceTabs } from "@/components/admin/PlaceTabs";
import { getAdminSession } from "@/lib/admin-auth";
import { loadAdminPlace } from "@/lib/admin-place-form";
import { commentOverall, getCommentRepliesCollection, getPlaceCommentsCollection, type CommentRatingsDoc } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const mono = "var(--font-plex-mono), ui-monospace, monospace";

const ratingLabels: { key: keyof CommentRatingsDoc; label: string }[] = [
  { key: "character", label: "Character" },
  { key: "food_drink", label: "Food & drink" },
  { key: "walks", label: "Walks" },
  { key: "getting_around", label: "Getting around" },
  { key: "value", label: "Value" },
];

function formatWhen(value: Date) {
  const days = Math.max(0, Math.round((Date.now() - value.getTime()) / 86400000));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months <= 1 ? "1 month ago" : `${months} months ago`;
}

export default async function PlaceCommentsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const { id } = await params;
  const place = await loadAdminPlace(id);
  if (!place) notFound();

  const comments = await getPlaceCommentsCollection();
  const docs = await comments.find({ place_id: id }).sort({ created_at: -1 }).toArray();
  const replies = await getCommentRepliesCollection();
  const replyDocs = await replies
    .find({ comment_id: { $in: docs.map((doc) => String(doc._id)) } })
    .sort({ created_at: 1 })
    .toArray();
  const overall =
    docs.length === 0
      ? null
      : Math.round((docs.reduce((sum, row) => sum + (row.overall ?? commentOverall(row.ratings)), 0) / docs.length) * 10) / 10;

  const threads: PlaceCommentThread[] = docs.map((row) => ({
    id: String(row._id),
    userType: row.user_type,
    comment: row.comment,
    ratings: ratingLabels.map((field) => ({ label: field.label, value: row.ratings?.[field.key] ?? 0 })),
    overall: row.overall ?? commentOverall(row.ratings),
    upcount: row.upcount,
    downcount: row.downcount,
    approval: row.approval === true,
    when: formatWhen(new Date(row.created_at)),
    replies: replyDocs
      .filter((reply) => reply.comment_id === String(row._id))
      .map((reply) => ({
        id: String(reply._id),
        userType: reply.user_type,
        comment: reply.comment,
        upcount: reply.upcount,
        downcount: reply.downcount,
        approval: reply.approval === true,
        when: formatWhen(new Date(reply.created_at)),
      })),
  }));

  return (
    <main className="px-5 py-10 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: mono }}>
        <Link href="/admin/place" className="underline">
          Place
        </Link>
        {" / "}
        {place.name}
      </p>
      <PlaceTabs placeId={id} active="comments" />
      <PlaceCommentBoard threads={threads} overall={overall} />
    </main>
  );
}
