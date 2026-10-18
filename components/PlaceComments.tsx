"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { PublicComment } from "@/lib/public-comments";

const sans =
  "var(--font-bricolage), system-ui, -apple-system, 'Segoe UI', sans-serif";
const mono = "var(--font-plex-mono), ui-monospace, monospace";

const ratingFields = [
  { key: "character", label: "Character" },
  { key: "food", label: "Food & drink" },
  { key: "walks", label: "Walks" },
  { key: "getting", label: "Getting around" },
  { key: "value", label: "Value" },
] as const;

type RatingKey = (typeof ratingFields)[number]["key"];

const roles = ["Someone who lives here", "Someone who has visited", "A day-tripper"];

const visitCounts = ["1", "2", "3", "multiple"] as const;

type VisitCount = (typeof visitCounts)[number];

function WhoYouAre({
  role,
  visits,
  onRole,
  onVisits,
}: {
  role: string;
  visits: VisitCount;
  onRole: (value: string) => void;
  onVisits: (value: VisitCount) => void;
}) {
  return (
    <div>
      <label className="block text-[15px]" style={{ fontFamily: sans, fontWeight: 500 }}>
        You are
        <span className="relative mt-2 block border border-black">
          <select
            value={role}
            onChange={(event) => onRole(event.target.value)}
            className="w-full cursor-pointer appearance-none bg-white px-3 py-2 pr-8 text-[15px] outline-none"
            style={{ fontFamily: sans, fontWeight: 500 }}
          >
            {roles.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[12px]" aria-hidden="true">
            ▾
          </span>
        </span>
      </label>
      {role === "Someone who has visited" ? (
        <fieldset className="mt-3">
          <legend className="text-[15px]" style={{ fontFamily: sans, fontWeight: 500 }}>
            How many times
          </legend>
          <span className="mt-2 inline-flex border border-black">
            {visitCounts.map((count, index) => {
              const selected = visits === count;
              return (
                <button
                  key={count}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onVisits(count)}
                  className={`h-8 border-black px-3 text-[14px] ${selected ? "bg-black text-white" : "bg-white"} ${
                    index < visitCounts.length - 1 ? "border-r" : ""
                  }`}
                  style={{ fontFamily: sans, fontWeight: 500 }}
                >
                  {count === "multiple" ? "Multiple" : count}
                </button>
              );
            })}
          </span>
        </fieldset>
      ) : null}
    </div>
  );
}

function badgeFor(role: string, visits: VisitCount) {
  if (role === "Someone who lives here") return "Lives here";
  if (role === "A day-tripper") return "Day-tripper";
  if (visits === "multiple") return "Visited multiple";
  return `Visited ${visits}×`;
}

type Thread = {
  id: string;
  kind: "comment" | "reply";
  commentId: string;
  badge: string;
  when: string;
  createdAt: number;
  score?: number;
  ratings?: Array<{ label: string; value: number }>;
  body: string;
  up: number;
  down: number;
  replies: Thread[];
};

function formatWhen(value: string) {
  const days = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 86400000));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months <= 1 ? "1 month ago" : `${months} months ago`;
}

function toThreads(comments: PublicComment[]): Thread[] {
  return comments.map((comment) => ({
    id: comment.id,
    kind: "comment",
    commentId: comment.id,
    badge: comment.user_type,
    when: formatWhen(comment.created_at),
    createdAt: new Date(comment.created_at).getTime(),
    score: comment.overall,
    ratings: comment.ratings
      ? [
          { label: "Character", value: comment.ratings.character },
          { label: "Food & drink", value: comment.ratings.food_drink },
          { label: "Walks", value: comment.ratings.walks },
          { label: "Getting around", value: comment.ratings.getting_around },
          { label: "Value", value: comment.ratings.value },
        ]
      : undefined,
    body: comment.comment,
    up: comment.upcount,
    down: comment.downcount,
    replies: comment.replies.filter((reply) => reply.approval).map((reply) => ({
      id: reply.id,
      kind: "reply" as const,
      commentId: comment.id,
      badge: reply.user_type,
      when: formatWhen(reply.created_at),
      createdAt: new Date(reply.created_at).getTime(),
      body: reply.comment,
      up: reply.upcount,
      down: reply.downcount,
      replies: [],
    })),
  }));
}

function countThreads(list: Thread[]): number {
  return list.reduce((total, thread) => total + 1 + countThreads(thread.replies), 0);
}

function replyWord(count: number) {
  return count === 1 ? "reply" : "replies";
}

function flattenReplies(list: Thread[]): Thread[] {
  return list.flatMap((thread) => [thread, ...flattenReplies(thread.replies)]);
}

export default function PlaceComments({
  placeName,
  placeId,
}: {
  placeName: string;
  placeId?: string;
}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [sort, setSort] = useState<"top" | "newest">("top");
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [votes, setVotes] = useState<Record<string, "up" | "down">>({});
  const [role, setRole] = useState(roles[0]);
  const [visits, setVisits] = useState<VisitCount>("1");
  const [replyRole, setReplyRole] = useState(roles[0]);
  const [replyVisits, setReplyVisits] = useState<VisitCount>("1");
  const [ratings, setRatings] = useState<Partial<Record<RatingKey, number>>>({});
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!placeId) return;
    let active = true;
    fetch("/api/comment/all")
      .then((response) => response.json())
      .then((body: { comments?: PublicComment[] }) => {
        if (!active) return;
        const mine = (body.comments ?? []).filter((comment) => comment.place_id === placeId && comment.approval);
        setThreads(toThreads(mine));
      })
      .catch(() => {
        if (active) setMessage("Could not load comments.");
      });
    return () => {
      active = false;
    };
  }, [placeId]);

  const chosen = ratingFields
    .map((field) => ratings[field.key])
    .filter((value): value is number => value != null);
  const overall =
    chosen.length === ratingFields.length
      ? (chosen.reduce((sum, value) => sum + value, 0) / ratingFields.length).toFixed(1)
      : null;

  const visible = useMemo(() => {
    const next = [...threads];
    next.sort((a, b) => (sort === "top" ? b.up - a.up : b.createdAt - a.createdAt));
    return next;
  }, [threads, sort]);

  function toggle(id: string) {
    setOpenIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function reload() {
    if (!placeId) return;
    const response = await fetch("/api/comment/all");
    const body = (await response.json().catch(() => null)) as { comments?: PublicComment[] } | null;
    const mine = (body?.comments ?? []).filter((comment) => comment.place_id === placeId && comment.approval);
    setThreads(toThreads(mine));
  }

  async function vote(id: string, direction: "up" | "down") {
    if (votes[id]) return;
    const thread = findThread(threads, id);
    if (!thread) return;
    setVotes((current) => ({ ...current, [id]: direction }));
    const response = await fetch(`/api/${thread.kind}/${id}/${direction}`, { method: "POST" });
    const body = (await response.json().catch(() => null)) as { upcount?: number; downcount?: number; message?: string } | null;
    if (!response.ok || body?.upcount == null || body.downcount == null) {
      setVotes((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setMessage(body?.message || "Could not record that vote.");
      return;
    }
    setThreads((current) =>
      mapThreads(current, id, (item) => ({ ...item, up: body.upcount ?? item.up, down: body.downcount ?? item.down })),
    );
  }

  async function publish(body: string, parentId?: string) {
    const text = body.trim();
    if (!text || !placeId) return;
    setMessage("");
    const parent = parentId ? findThread(threads, parentId) : undefined;
    const response = parent
      ? await fetch("/api/reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comment_id: parent.commentId,
            user_type: badgeFor(replyRole, replyVisits),
            comment: text,
          }),
        })
      : await fetch("/api/comment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_type: badgeFor(role, visits),
            place_id: placeId,
            comment: text,
            ratings: {
              character: ratings.character,
              food_drink: ratings.food,
              walks: ratings.walks,
              getting_around: ratings.getting,
              value: ratings.value,
            },
          }),
        });
    const result = (await response.json().catch(() => null)) as { message?: string } | null;
    if (!response.ok) {
      setMessage(result?.message || "Could not post that.");
      return;
    }
    if (parentId) {
      setOpenIds((current) => (current.includes(parent?.commentId ?? parentId) ? current : [...current, parent?.commentId ?? parentId]));
      setReplyTo(null);
      setReplyDraft("");
    } else {
      setDraft("");
      setSort("newest");
    }
    setMessage("Posted. It will show here once it is approved.");
    await reload();
  }

  return (
    <section id="comments" className="scroll-mt-32 border-t-2 border-black">
      <div
        className="flex items-center justify-between gap-4 bg-black px-4 py-2.5 text-white sm:px-5"
        style={{ fontFamily: mono, fontWeight: 500 }}
      >
        <p className="text-[11px] uppercase tracking-[0.12em]">Comments on {placeName}</p>
        <div className="flex items-center gap-2">
          <p className="text-[11px] uppercase tracking-[0.12em]">
            {countThreads(threads)} comments
          </p>
          <div className="flex">
            <SortButton active={sort === "top"} onClick={() => setSort("top")}>
              Top
            </SortButton>
            <SortButton active={sort === "newest"} onClick={() => setSort("newest")}>
              Newest
            </SortButton>
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[23rem_minmax(0,1fr)]">
        <form
          className="border-b-2 border-black px-4 py-6 sm:px-5 lg:border-r-2 lg:border-b-0"
          onSubmit={(event) => {
            event.preventDefault();
            publish(draft);
          }}
        >
          <h2
            className="text-[3.4rem] leading-[0.9] tracking-[-0.04em]"
            style={{ fontFamily: sans, fontWeight: 800 }}
          >
            Join in.
          </h2>

          <div className="mt-4 border-2 border-black p-4 shadow-[6px_6px_0_0_#000]">
            <label className="block text-[15px]" style={{ fontFamily: sans, fontWeight: 500 }}>
              You are
              <span className="relative mt-2 block border border-black">
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="w-full cursor-pointer appearance-none bg-white px-3 py-2 pr-8 text-[15px] outline-none"
                  style={{ fontFamily: sans, fontWeight: 500 }}
                >
                  {roles.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[12px]" aria-hidden="true">
                  ▾
                </span>
              </span>
            </label>

            {role === "Someone who has visited" ? (
              <fieldset className="mt-4">
                <legend className="text-[15px]" style={{ fontFamily: sans, fontWeight: 500 }}>
                  How many times
                </legend>
                <span className="mt-2 inline-flex border border-black">
                  {visitCounts.map((count, index) => {
                    const selected = visits === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setVisits(count)}
                        className={`h-8 border-black px-3 text-[14px] ${
                          selected ? "bg-black text-white" : "bg-white"
                        } ${index < visitCounts.length - 1 ? "border-r" : ""}`}
                        style={{ fontFamily: sans, fontWeight: 500 }}
                      >
                        {count === "multiple" ? "Multiple" : count}
                      </button>
                    );
                  })}
                </span>
              </fieldset>
            ) : null}

            <fieldset className="mt-4">
              <legend className="text-[15px]" style={{ fontFamily: sans, fontWeight: 500 }}>
                Your ratings
              </legend>
              <div className="mt-3 space-y-2.5">
                {ratingFields.map((field) => (
                  <div key={field.key} className="flex items-center justify-between gap-3">
                    <span className="max-w-[5.5rem] text-[14px] leading-tight" style={{ fontFamily: sans }}>
                      {field.label}
                    </span>
                    <span className="inline-flex border border-black">
                      {[1, 2, 3, 4, 5].map((value) => {
                        const selected = ratings[field.key] === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            aria-label={`${field.label} ${value}`}
                            aria-pressed={selected}
                            onClick={() =>
                              setRatings((current) => ({ ...current, [field.key]: value }))
                            }
                            className={`h-8 w-8 border-black text-[14px] ${
                              selected ? "bg-black text-white" : "bg-white"
                            } ${value < 5 ? "border-r" : ""}`}
                            style={{ fontFamily: sans, fontWeight: 500 }}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </fieldset>

            <div className="mt-4 flex items-center gap-3 bg-[#FFE14A] px-3 py-3">
              <span className="text-[1.2rem] tracking-[-0.03em]" style={{ fontFamily: sans, fontWeight: 800 }}>
                Overall
              </span>
              {overall ? (
                <span className="text-[1.2rem]" style={{ fontFamily: sans, fontWeight: 700 }}>
                  {overall}
                </span>
              ) : (
                <span className="inline-block h-[3px] w-3.5 bg-black" aria-hidden="true" />
              )}
              <span className="max-w-[8.5rem] text-[13px] leading-tight" style={{ fontFamily: sans }}>
                Average of your five ratings
              </span>
            </div>

            <label className="mt-4 block text-[15px]" style={{ fontFamily: sans, fontWeight: 500 }}>
              Your comment
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={4}
                placeholder="What should people do, skip, or argue about?"
                className="mt-2 w-full resize-y border border-black px-3 py-2 text-[15px] outline-none placeholder:text-neutral-400"
                style={{ fontFamily: sans, fontWeight: 500 }}
              />
            </label>
            {message ? (
              <p className="mt-3 text-[14px]" style={{ fontFamily: sans }}>
                {message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={!placeId || overall == null || draft.trim().length === 0}
              className="mt-4 w-full bg-black px-3 py-2.5 text-[15px] text-white disabled:opacity-50"
              style={{ fontFamily: sans, fontWeight: 600 }}
            >
              Post rating and comment
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6">
          {visible.length === 0 ? (
            <p className="text-[15px]" style={{ fontFamily: sans }}>
              No comments yet.
            </p>
          ) : null}
          {visible.map((thread) => (
            <CommentCard
              key={thread.id}
              thread={thread}
              openIds={openIds}
              votes={votes}
              replyTo={replyTo}
              replyDraft={replyDraft}
              role={replyRole}
              visits={replyVisits}
              onRole={setReplyRole}
              onVisits={setReplyVisits}
              onToggle={toggle}
              onVote={vote}
              onReplyTo={(id) => {
                setReplyTo(id);
                setReplyDraft("");
              }}
              onReplyDraft={setReplyDraft}
              onReply={(parentId) => publish(replyDraft, parentId)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 text-[11px] uppercase tracking-[0.08em] ${
        active ? "bg-white text-black" : "bg-black text-white"
      }`}
      style={{ fontFamily: mono, fontWeight: 500 }}
    >
      {children}
    </button>
  );
}

function CommentCard({
  thread,
  openIds,
  votes,
  replyTo,
  replyDraft,
  role,
  visits,
  onRole,
  onVisits,
  onToggle,
  onVote,
  onReplyTo,
  onReplyDraft,
  onReply,
}: {
  thread: Thread;
  openIds: string[];
  votes: Record<string, "up" | "down">;
  replyTo: string | null;
  replyDraft: string;
  role: string;
  visits: VisitCount;
  onRole: (value: string) => void;
  onVisits: (value: VisitCount) => void;
  onToggle: (id: string) => void;
  onVote: (id: string, direction: "up" | "down") => void;
  onReplyTo: (id: string) => void;
  onReplyDraft: (value: string) => void;
  onReply: (parentId: string) => void;
}) {
  const open = openIds.includes(thread.id);
  const replies = flattenReplies(thread.replies);
  const replyCount = replies.length;

  return (
    <article className="border-2 border-black px-4 py-4">
      <CommentBody
        thread={thread}
        votes={votes}
        replyTo={replyTo}
        replyDraft={replyDraft}
        role={role}
        visits={visits}
        onRole={onRole}
        onVisits={onVisits}
        onVote={onVote}
        onReplyTo={onReplyTo}
        onReplyDraft={onReplyDraft}
        onReply={onReply}
        extra={
          replyCount > 0 ? (
            <button
              type="button"
              onClick={() => onToggle(thread.id)}
              className="border border-dashed border-black px-2 py-1 text-[13px]"
              style={{ fontFamily: sans }}
            >
              {open ? "Hide" : "Show"} {replyCount} {replyWord(replyCount)}
            </button>
          ) : null
        }
      />

      {open
        ? replies.map((reply) => (
            <div key={reply.id} className="mt-4 border-t border-dashed border-black pt-4 pl-5">
              <CommentBody
                thread={reply}
                votes={votes}
                replyTo={replyTo}
                replyDraft={replyDraft}
                role={role}
                visits={visits}
                onRole={onRole}
                onVisits={onVisits}
                onVote={onVote}
                onReplyTo={onReplyTo}
                onReplyDraft={onReplyDraft}
                onReply={onReply}
              />
            </div>
          ))
        : null}
    </article>
  );
}

function CommentBody({
  thread,
  votes,
  replyTo,
  replyDraft,
  role,
  visits,
  onRole,
  onVisits,
  onVote,
  onReplyTo,
  onReplyDraft,
  onReply,
  extra,
}: {
  thread: Thread;
  votes: Record<string, "up" | "down">;
  replyTo: string | null;
  replyDraft: string;
  role: string;
  visits: VisitCount;
  onRole: (value: string) => void;
  onVisits: (value: VisitCount) => void;
  onVote: (id: string, direction: "up" | "down") => void;
  onReplyTo: (id: string) => void;
  onReplyDraft: (value: string) => void;
  onReply: (parentId: string) => void;
  extra?: ReactNode;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className="bg-[#FFE14A] px-1.5 py-1 text-[10px] uppercase tracking-[0.08em]"
          style={{ fontFamily: mono, fontWeight: 500 }}
        >
          {thread.badge}
        </span>
        <span
          className="text-[11px] uppercase tracking-[0.08em] text-neutral-500"
          style={{ fontFamily: mono, fontWeight: 500 }}
        >
          {thread.when}
        </span>
      </div>

      {thread.score != null && thread.ratings ? (
        <div className="mt-3 flex items-stretch border border-black">
          <span
            className="flex items-center bg-black px-2 text-[1.35rem] tracking-[-0.03em] text-white"
            style={{ fontFamily: sans, fontWeight: 800 }}
          >
            {thread.score.toFixed(1)}
          </span>
          {thread.ratings.map((rating) => (
            <span
              key={rating.label}
              className="flex items-center border-l border-black px-2 text-[10px] uppercase tracking-[0.06em] sm:px-3"
              style={{ fontFamily: mono, fontWeight: 500 }}
            >
              {rating.label} {rating.value}
            </span>
          ))}
        </div>
      ) : null}

      <p className="mt-3 text-[16px] leading-relaxed" style={{ fontFamily: sans }}>
        {thread.body}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <VoteButton
          label="Upvote"
          pressed={votes[thread.id] === "up"}
          onClick={() => onVote(thread.id, "up")}
        >
          ▲ {thread.up}
        </VoteButton>
        <VoteButton
          label="Downvote"
          pressed={votes[thread.id] === "down"}
          onClick={() => onVote(thread.id, "down")}
        >
          ▼ {thread.down}
        </VoteButton>
        <button
          type="button"
          onClick={() => onReplyTo(thread.id)}
          className="border border-black px-2 py-1 text-[13px]"
          style={{ fontFamily: sans }}
        >
          ↩ Reply
        </button>
        {extra}
      </div>

      {replyTo === thread.id ? (
        <form
          className="mt-3"
          onSubmit={(event) => {
            event.preventDefault();
            onReply(thread.id);
          }}
        >
          <WhoYouAre role={role} visits={visits} onRole={onRole} onVisits={onVisits} />
          <textarea
            value={replyDraft}
            onChange={(event) => onReplyDraft(event.target.value)}
            rows={3}
            placeholder="Reply"
            className="mt-3 w-full resize-y border border-black px-3 py-2 text-[15px] outline-none"
            style={{ fontFamily: sans }}
          />
          <button
            type="submit"
            className="mt-2 border border-black bg-black px-3 py-1.5 text-[14px] text-white"
            style={{ fontFamily: sans, fontWeight: 600 }}
          >
            Reply
          </button>
        </form>
      ) : null}
    </>
  );
}

function VoteButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`border border-black px-2 py-1 text-[13px] ${pressed ? "bg-black text-white" : "bg-white"}`}
      style={{ fontFamily: sans }}
    >
      {children}
    </button>
  );
}

function findThread(list: Thread[], id: string): Thread | undefined {
  for (const thread of list) {
    if (thread.id === id) return thread;
    const nested = findThread(thread.replies, id);
    if (nested) return nested;
  }
  return undefined;
}

function mapThreads(list: Thread[], id: string, update: (thread: Thread) => Thread): Thread[] {
  return list.map((thread) => {
    if (thread.id === id) return update(thread);
    return { ...thread, replies: mapThreads(thread.replies, id, update) };
  });
}
