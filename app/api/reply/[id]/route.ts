import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getCommentRepliesCollection } from "@/lib/mongodb";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Sign in required." }, { status: 401 });

  const { id } = await context.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json({ message: "A valid reply id is required." }, { status: 400 });
  }
  const body = (await request.json().catch(() => null)) as { approval?: boolean } | null;
  if (typeof body?.approval !== "boolean") {
    return NextResponse.json({ message: "Approval must be true or false." }, { status: 400 });
  }
  const replies = await getCommentRepliesCollection();
  const updated = await replies.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { approval: body.approval } },
    { returnDocument: "after" },
  );
  if (!updated) return NextResponse.json({ message: "That reply was not found." }, { status: 404 });
  return NextResponse.json({ id, approval: updated.approval });
}
