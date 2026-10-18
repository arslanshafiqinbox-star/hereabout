import { NextResponse } from "next/server";
import { listCommentThreads } from "@/lib/public-comments";

export async function GET() {
  return NextResponse.json({ comments: await listCommentThreads() });
}
