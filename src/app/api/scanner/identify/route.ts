import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/session";
import { getVisionProvider } from "@/lib/ai";
import { validateImageFile } from "@/lib/validation/upload";
import { toFriendlyMessage } from "@/lib/errors";

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
