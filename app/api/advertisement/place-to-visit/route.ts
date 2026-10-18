import { NextResponse } from "next/server";
import { listSiteSponsors } from "@/lib/directory-sponsors";

export async function GET() {
  return NextResponse.json(await listSiteSponsors("place-to-visit"));
}
