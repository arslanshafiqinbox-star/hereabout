import { NextResponse } from "next/server";
import { listPublicVisits } from "@/lib/public-visits";

export async function GET() {
  return NextResponse.json({ visits: await listPublicVisits() });
}
