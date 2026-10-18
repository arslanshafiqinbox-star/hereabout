"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const sans = "var(--font-bricolage), system-ui, sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

export type PlaceCommentReply = {
  id: string;
  userType: string;
  comment: string;
  upcount: number;
  downcount: number;
  approval: boolean;
  when: string;
};

export type PlaceCommentThread = {
  id: string;
  userType: string;
  comment: string;
  ratings: { label: string; value: number }[];
  overall: number;
  upcount: number;
  downcount: number;
  approval: boolean;
  when: string;
  replies: PlaceCommentReply[];
};

export function PlaceCommentBoard({
  threads,
  overall,
}: {
  threads: PlaceCommentThread[];
  overall: number | null;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "waiting">("all");
  const [pendingId, setPendingId] = useState("");
  const [message, setMessage] = useState("");

  const waitingComments = threads.filter((thread) => !thread.approval).length;
  const replyCount = threads.reduce((sum, thread) => sum + thread.replies.length, 0);
  const waitingReplies = threads.reduce(
    (sum, thread) => sum + thread.replies.filter((reply) => !reply.approval).length,
    0,
  );
  const visible = useMemo(
    () =>
      filter === "all"
        ? threads
        : threads.filter((thread) => !thread.approval || thread.replies.some((reply) => !reply.approval)),
    [filter, threads],
  );

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
    <div>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: mono }}>
            {threads.length} {threads.length === 1 ? "comment" : "comments"}
            {" · "}
            {replyCount} {replyCount === 1 ? "reply" : "replies"}
            {overall !== null ? ` · overall ${overall.toFixed(1)}` : ""}
          </p>
          <h1 className="mt-2 text-5xl leading-none tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 560 }}>
            Comments
          </h1>
        </div>
        <div className="flex border-2 border-black" role="group" aria-label="Filter comments">
          {(
            [
              ["all", "All"],
              ["waiting", `Waiting ${waitingComments + waitingReplies}`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`border-r-2 border-black px-4 py-2 text-[12px] uppercase tracking-[0.12em] last:border-r-0 ${
                filter === id ? "bg-[#FFD200]" : "bg-white"
              }`}
              style={{ fontFamily: mono }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {message ? (
        <p className="mt-4 text-sm" style={{ fontFamily: sans }}>
          {message}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <div className="mt-8 border-2 border-black px-4 py-8 text-sm" style={{ fontFamily: sans }}>
          {threads.length === 0 ? "No comments yet." : "Nothing is waiting."}
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-5">
          {visible.map((thread) => {
            const replies = filter === "waiting" ? thread.replies.filter((reply) => !reply.approval) : thread.replies;
            return (
              <article key={thread.id} className="border-2 border-black">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#FFD200] px-2 py-1 text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: mono }}>
                      {thread.userType}
                    </span>
                    <span className="bg-black px-2 py-1 text-[15px] text-white" style={{ fontFamily: sans, fontWeight: 700 }}>
                      {thread.overall.toFixed(1)}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: mono }}>
                      {thread.when}
                    </span>
                    <Status approval={thread.approval} />
                  </div>
                  <ApprovalActions
                    approval={thread.approval}
                    pending={pendingId === thread.id}
                    onChange={(approval) => setApproval("comment", thread.id, approval)}
                  />
                </header>
                <p className="px-4 py-4 text-[16px] leading-relaxed" style={{ fontFamily: sans }}>
                  {thread.comment}
                </p>
                <div className="flex flex-wrap gap-2 px-4 pb-4">
                  {thread.ratings.map((rating) => (
                    <span key={rating.label} className="border-2 border-black px-2 py-1 text-[11px] uppercase tracking-[0.08em]" style={{ fontFamily: mono }}>
                      {rating.label} {rating.value.toFixed(1)}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4 border-t-2 border-black px-4 py-3 text-[13px]" style={{ fontFamily: mono }}>
                  <span>▲ {thread.upcount}</span>
                  <span>▼ {thread.downcount}</span>
                  <span>
                    {thread.replies.length} {thread.replies.length === 1 ? "reply" : "replies"}
                  </span>
                </div>
                {replies.length > 0 ? (
                  <div className="border-t-2 border-black bg-neutral-50">
                    {replies.map((reply) => (
                      <div key={reply.id} className="border-b-2 border-black px-4 py-4 last:border-b-0 sm:pl-10">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="border-2 border-black bg-white px-2 py-1 text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: mono }}>
                                {reply.userType}
                              </span>
                              <span className="text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: mono }}>
                                {reply.when}
                              </span>
                              <Status approval={reply.approval} />
                            </div>
                            <p className="mt-3 text-[15px] leading-relaxed" style={{ fontFamily: sans }}>
                              {reply.comment}
                            </p>
                            <p className="mt-3 text-[13px]" style={{ fontFamily: mono }}>
                              ▲ {reply.upcount} · ▼ {reply.downcount}
                            </p>
                          </div>
                          <ApprovalActions
                            approval={reply.approval}
                            pending={pendingId === reply.id}
                            onChange={(approval) => setApproval("reply", reply.id, approval)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Status({ approval }: { approval: boolean }) {
  return (
    <span
      className={`px-2 py-1 text-[11px] uppercase tracking-[0.12em] ${approval ? "bg-black text-white" : "border-2 border-black"}`}
      style={{ fontFamily: mono }}
    >
      {approval ? "Approved" : "Waiting"}
    </span>
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
