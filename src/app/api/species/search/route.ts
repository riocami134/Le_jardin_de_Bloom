import { NextResponse } from "next/server";
import { searchSpecies } from "@/server/queries/species";
import { speciesSearchSchema } from "@/lib/validation/species";
import { toFriendlyMessage } from "@/lib/errors";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = speciesSearchSchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Requête invalide" }, { status: 400 });
    }
    const species = await searchSpecies(parsed.data);
    return NextResponse.json({ species });
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}
