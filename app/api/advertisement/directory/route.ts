import { NextResponse } from "next/server";
import { listDirectorySponsors } from "@/lib/directory-sponsors";

export async function GET() {
  return NextResponse.json(await listDirectorySponsors());
}
