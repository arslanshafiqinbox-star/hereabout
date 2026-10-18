import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getPlaceCommentsCollection } from "@/lib/mongodb";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json({ message: "A valid comment id is required." }, { status: 400 });
  }
  const comments = await getPlaceCommentsCollection();
  const updated = await comments.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $inc: { upcount: 1 } },
    { returnDocument: "after" },
  );
  if (!updated) return NextResponse.json({ message: "That comment was not found." }, { status: 404 });
  return NextResponse.json({ id, upcount: updated.upcount, downcount: updated.downcount });
}
