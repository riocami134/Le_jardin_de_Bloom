"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/session";
import { createPlantSchema, createCareActionSchema, type CreatePlantInput, type CreateCareActionInput } from "@/lib/validation/plant";

export interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

export async function createPlantAction(input: CreatePlantInput): Promise<ActionResult> {
  const parsed = createPlantSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const userId = await requireUserId();

  const plant = await prisma.$transaction(async (tx) => {
    const created = await tx.plant.create({
      data: {
        userId,
        speciesId: parsed.data.speciesId,
        name: parsed.data.name,
        nickname: parsed.data.nickname,
        notes: parsed.data.notes,
        locationId: parsed.data.locationId,
        environmentId: parsed.data.environmentId,
      },
    });

    const garden = await tx.virtualGarden.upsert({ where: { userId }, update: {}, create: { userId } });
    await tx.gardenItem.create({
      data: { virtualGardenId: garden.id, plantId: created.id, type: "sprout", originAction: "plant_added" },
    });

    const plantCount = await tx.plant.count({ where: { userId, deletedAt: null } });
    await tx.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId: "first_plant" } },
      update: {},
      create: { userId, achievementId: "first_plant" },
    });
    await tx.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId: "first_garden_item" } },
      update: {},
      create: { userId, achievementId: "first_garden_item" },
    });
    if (plantCount >= 3) {
      await tx.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: "collection_3" } },
        update: {},
        create: { userId, achievementId: "collection_3" },
      });
    }

    return created;
  });

  revalidatePath("/plants");
  revalidatePath("/");
  return { success: true, id: plant.id };
}

export async function addCareActionAction(plantId: string, input: CreateCareActionInput): Promise<ActionResult> {
  const parsed = createCareActionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const userId = await requireUserId();
  const plant = await prisma.plant.findFirst({ where: { id: plantId, userId, deletedAt: null } });
  if (!plant) {
    return { success: false, error: "Plante introuvable" };
  }

  await prisma.$transaction(async (tx) => {
    const careAction = await tx.careAction.create({
      data: {
        plantId,
        type: parsed.data.type,
        note: parsed.data.note,
        performedAt: parsed.data.performedAt ?? new Date(),
      },
    });

    if (parsed.data.type === "watering") {
      await tx.wateringEvent.create({ data: { careActionId: careAction.id, amountMl: parsed.data.amountMl } });
    } else if (parsed.data.type === "fertilizing") {
      await tx.fertilizingEvent.create({ data: { careActionId: careAction.id, product: parsed.data.product } });
    } else if (parsed.data.type === "repotting") {
      await tx.repottingEvent.create({ data: { careActionId: careAction.id, potSizeCm: parsed.data.potSizeCm } });
    } else if (parsed.data.type === "pruning") {
      await tx.pruningEvent.create({ data: { careActionId: careAction.id, partsRemoved: parsed.data.partsRemoved } });
    }

    const careCount = await tx.careAction.count({ where: { plant: { userId } } });
    await tx.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId: "first_care" } },
      update: {},
      create: { userId, achievementId: "first_care" },
    });
    if (careCount >= 10) {
      await tx.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: "care_10" } },
        update: {},
        create: { userId, achievementId: "care_10" },
      });
    }
  });

  revalidatePath(`/plants/${plantId}`);
  revalidatePath("/");
  return { success: true };
}

export async function deletePlantAction(plantId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const plant = await prisma.plant.findFirst({ where: { id: plantId, userId, deletedAt: null } });
  if (!plant) {
    return { success: false, error: "Plante introuvable" };
  }

  await prisma.$transaction([
    prisma.plant.update({ where: { id: plantId }, data: { deletedAt: new Date() } }),
    // La suppression est un soft delete (deletedAt) : la cascade SQL onDelete
    // ne se déclenche pas, donc les éléments du jardin liés à cette plante
    // doivent être retirés explicitement pour ne pas y rester "orphelins".
    prisma.gardenItem.deleteMany({ where: { plantId } }),
  ]);

  revalidatePath("/plants");
  revalidatePath("/garden");
  revalidatePath("/");
  return { success: true };
}
