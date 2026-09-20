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
    const page = Number(searchParams.get("page")) || 1;
    const result = await searchSpecies(parsed.data, page);
    return NextResponse.json({ species: result.items, total: result.total, page: result.page, totalPages: result.totalPages });
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}
