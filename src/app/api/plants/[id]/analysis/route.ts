import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getStorageProvider } from "@/lib/storage";
import { validateImageFile } from "@/lib/validation/upload";
import { healthObservationFlagsSchema } from "@/lib/validation/health-analysis";
import { statusFromScore } from "@/lib/botanics/health-status";
import { toFriendlyMessage } from "@/lib/errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await requireUserId();

    const plant = await prisma.plant.findFirst({ where: { id, userId, deletedAt: null } });
    if (!plant) {
      return NextResponse.json({ error: "Plante introuvable" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucune photo reçue." }, { status: 400 });
    }
    const validation = validateImageFile(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const score = Number(formData.get("score"));
    const confidence = Number(formData.get("confidence"));
    const observationsParsed = healthObservationFlagsSchema.safeParse(JSON.parse(String(formData.get("observations") ?? "{}")));
    if (!Number.isFinite(score) || !Number.isFinite(confidence) || !observationsParsed.success) {
      return NextResponse.json({ error: "Données d'analyse invalides." }, { status: 400 });
    }
    const hypotheses = JSON.parse(String(formData.get("hypotheses") ?? "[]"));
    const recommendations = JSON.parse(String(formData.get("recommendations") ?? "[]"));

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorageProvider();
    const { key } = await storage.upload({ buffer, fileName: file.name, mimeType: file.type, ownerId: userId });

    const status = statusFromScore(score);

    const result = await prisma.$transaction(async (tx) => {
      const photo = await tx.plantPhoto.create({ data: { plantId: id, storageKey: key } });
      const analysis = await tx.healthAnalysis.create({
        data: {
          plantId: id,
          photoId: photo.id,
          score,
          confidence,
          observations: observationsParsed.data,
          hypotheses,
          recommendations,
        },
      });
      const previousScore = plant.healthScore;
      await tx.plant.update({ where: { id }, data: { healthScore: score, status } });

      await tx.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: "first_scan" } },
        update: {},
        create: { userId, achievementId: "first_scan" },
      });
      await tx.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: "first_analysis" } },
        update: {},
        create: { userId, achievementId: "first_analysis" },
      });
      if (previousScore !== null && score > previousScore) {
        await tx.userAchievement.upsert({
          where: { userId_achievementId: { userId, achievementId: "first_improvement" } },
          update: {},
          create: { userId, achievementId: "first_improvement" },
        });
      }

      return { photoId: photo.id, analysisId: analysis.id };
    });

    revalidatePath(`/plants/${id}`);
    revalidatePath("/");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}
