"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const sans = "var(--font-bricolage), system-ui, sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

export type ModerationComment = {
  id: string;
  userType: string;
  comment: string;
  placeName: string;
  overall: number;
  upcount: number;
  downcount: number;
  approval: boolean;
};

export type ModerationReply = {
  id: string;
  commentId: string;
  userType: string;
  comment: string;
  upcount: number;
  downcount: number;
  approval: boolean;
};

export function CommentModeration({
  comments,
  replies,
}: {
  comments: ModerationComment[];
  replies: ModerationReply[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(comments[0]?.id ?? "");
  const [pendingId, setPendingId] = useState("");
  const [message, setMessage] = useState("");
  const selected = comments.find((comment) => comment.id === selectedId) ?? null;
  const selectedReplies = replies.filter((reply) => reply.commentId === selected?.id);

  async function setApproval(kind: "comment" | "reply", id: string, approval: boolean) {
    setMessage("");
    setPendingId(id);
    const response = await fetch(kind === "comment" ? `/api/comment/${id}` : `/api/reply/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approval }),
    });
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    setPendingId("");
    if (!response.ok) {
      setMessage(body?.message || "Could not update approval.");
      return;
    }
    router.refresh();
  }

  return (
    <main className="px-5 py-10 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: mono }}>
        {comments.length} {comments.length === 1 ? "comment" : "comments"}
      </p>
      <h1 className="mt-2 text-5xl leading-none tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 560 }}>
        Comments
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-neutral-700" style={{ fontFamily: sans }}>
        Choose a comment to see the replies linked to it. Approve or disapprove each one.
      </p>
      {message ? (
        <p className="mt-4 text-sm" style={{ fontFamily: sans }}>
          {message}
        </p>
      ) : null}

      <section className="mt-8">
        <h2 className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
          Comments
        </h2>
        <div className="mt-3 overflow-x-auto border-2 border-black">
          <table className="w-full min-w-[64rem] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-black bg-neutral-50">
                {["User type", "Comment", "Place", "Overall", "Up", "Down", ""].map((heading) => (
                  <th
                    key={heading || "actions"}
                    className="border-r-2 border-black px-4 py-3 text-[11px] uppercase tracking-[0.14em] last:border-r-0"
                    style={{ fontFamily: mono, fontWeight: 500 }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-sm" style={{ fontFamily: sans }}>
                    No comments yet.
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <tr
                    key={comment.id}
                    onClick={() => setSelectedId(comment.id)}
                    className={`cursor-pointer border-b-2 border-black last:border-b-0 ${
                      selectedId === comment.id ? "bg-[#FFD200]" : "hover:bg-neutral-50"
                    }`}
                  >
                    <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans, fontWeight: 600 }}>
                      {comment.userType}
                    </td>
                    <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                      {comment.comment}
                    </td>
                    <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                      {comment.placeName}
                    </td>
                    <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: mono }}>
                      {comment.overall.toFixed(1)}
                    </td>
                    <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: mono }}>
                      {comment.upcount}
                    </td>
                    <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: mono }}>
                      {comment.downcount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3" onClick={(event) => event.stopPropagation()}>
                      <ApprovalActions
                        approval={comment.approval}
                        pending={pendingId === comment.id}
                        onChange={(approval) => setApproval("comment", comment.id, approval)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: mono }}>
          Replies{selected ? ` · ${selected.userType}` : ""}
        </h2>
        <div className="mt-3 overflow-x-auto border-2 border-black">
          <table className="w-full min-w-[52rem] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-black bg-neutral-50">
                {["User type", "Reply", "Up", "Down", ""].map((heading) => (
                  <th
                    key={heading || "actions"}
                    className="border-r-2 border-black px-4 py-3 text-[11px] uppercase tracking-[0.14em] last:border-r-0"
                    style={{ fontFamily: mono, fontWeight: 500 }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!selected ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-sm" style={{ fontFamily: sans }}>
                    No comments yet.
                  </td>
                </tr>
              ) : selectedReplies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-sm" style={{ fontFamily: sans }}>
                    No replies on this comment.
                  </td>
                </tr>
              ) : (
                selectedReplies.map((reply) => (
                  <tr key={reply.id} className="border-b-2 border-black last:border-b-0">
                    <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans, fontWeight: 600 }}>
                      {reply.userType}
                    </td>
                    <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: sans }}>
                      {reply.comment}
                    </td>
                    <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: mono }}>
                      {reply.upcount}
                    </td>
                    <td className="border-r-2 border-black px-4 py-3" style={{ fontFamily: mono }}>
                      {reply.downcount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <ApprovalActions
                        approval={reply.approval}
                        pending={pendingId === reply.id}
                        onChange={(approval) => setApproval("reply", reply.id, approval)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function ApprovalActions({
  approval,
  pending,
  onChange,
}: {
  approval: boolean;
  pending: boolean;
  onChange: (approval: boolean) => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending || approval}
        onClick={() => onChange(true)}
        className={`border-2 border-black px-3 py-2 text-[11px] uppercase tracking-[0.12em] disabled:opacity-40 ${
          approval ? "bg-[#FFD200]" : "bg-white"
        }`}
        style={{ fontFamily: mono }}
      >
        Approve
      </button>
      <button
        type="button"
        disabled={pending || !approval}
        onClick={() => onChange(false)}
        className={`border-2 border-black px-3 py-2 text-[11px] uppercase tracking-[0.12em] disabled:opacity-40 ${
          !approval ? "bg-black text-white" : "bg-white"
        }`}
        style={{ fontFamily: mono }}
      >
        Disapprove
      </button>
    </div>
  );
}
