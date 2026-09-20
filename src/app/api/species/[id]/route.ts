import { NextResponse } from "next/server";
import { getSpeciesById } from "@/server/queries/species";
import { toFriendlyMessage } from "@/lib/errors";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const species = await getSpeciesById(id);
    if (!species) return NextResponse.json({ error: "Espèce introuvable" }, { status: 404 });
    return NextResponse.json({ species });
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}
