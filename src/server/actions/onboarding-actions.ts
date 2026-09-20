"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/session";
import { onboardingSchema, type OnboardingInput } from "@/lib/validation/onboarding";

export interface OnboardingResult {
  success: boolean;
  error?: string;
}

export async function completeOnboardingAction(input: OnboardingInput): Promise<OnboardingResult> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const userId = await requireUserId();

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        city: parsed.data.city,
        plantLocationType: parsed.data.plantLocationType,
        pets: parsed.data.pets,
        plantCountRange: parsed.data.plantCountRange,
        onboardedAt: new Date(),
      },
    });

    await tx.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId: "first_bloom_meeting" } },
      update: {},
      create: { userId, achievementId: "first_bloom_meeting" },
    });

    await tx.virtualGarden.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  });

  revalidatePath("/");
  return { success: true };
}
