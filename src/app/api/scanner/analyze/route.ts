import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/session";
import { getVisionProvider } from "@/lib/ai";
import { bloomService } from "@/server/services/bloom-service";
import { validateImageFile } from "@/lib/validation/upload";
import { toFriendlyMessage } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    await requireUserId();

    const formData = await request.formData();
    const file = formData.get("file");
    const plantName = (formData.get("plantName") as string | null) ?? "cette plante";
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucune photo reçue." }, { status: 400 });
    }

    const validation = validateImageFile(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const health = await getVisionProvider().analyzePlantHealth({ imageUrl: `${file.name}-${file.size}` });

    const needsQuestions = health.confidence < 0.65;
    const questions = needsQuestions
      ? await bloomService.getDiagnosisQuestions({ plantName, observations: health.flags })
      : [];
    const recommendation = await bloomService.getRecommendation({ plantName, observations: health.flags });
    const bloomMessage = await bloomService.getMessage({ plantName, observations: health.flags });

    return NextResponse.json({ health, questions, recommendation, bloomMessage });
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}
