import { NextResponse } from "next/server";
import { listPublicPlaces } from "@/lib/public-places";

export async function GET() {
  return NextResponse.json({ places: await listPublicPlaces("Town") });
}
