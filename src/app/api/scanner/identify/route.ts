import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/session";
import { getVisionProvider } from "@/lib/ai";
import { validateImageFile } from "@/lib/validation/upload";
import { toFriendlyMessage } from "@/lib/errors";

// Au-delà de la limite par défaut (10s sur le plan Hobby) : le fournisseur
// IA retente automatiquement en cas de surcharge temporaire (ex. 503 "high
// demand" sur le palier gratuit de Gemini), ce qui peut dépasser 10s.
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    await requireUserId();

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucune photo reçue." }, { status: 400 });
    }

    const validation = validateImageFile(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const imageBase64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const identification = await getVisionProvider().identifyPlant({
      imageBase64,
      mimeType: file.type,
    });

    return NextResponse.json({ identification });
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}
