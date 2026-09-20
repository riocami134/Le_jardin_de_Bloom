import { NextResponse } from "next/server";
import { getAllSpecies } from "@/server/queries/species";
import { toFriendlyMessage } from "@/lib/errors";

export async function GET() {
  try {
    const species = await getAllSpecies();
    return NextResponse.json({ species });
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}
