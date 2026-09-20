"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/session";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  city: z.string().trim().max(80).optional(),
});

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city") || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const userId = await requireUserId();
  await prisma.user.update({ where: { id: userId }, data: { name: parsed.data.name, city: parsed.data.city } });

  revalidatePath("/profile");
  revalidatePath("/settings");
  return { success: true };
}

export async function updateConsentAction(input: { consentLocation?: boolean; consentNotifications?: boolean }): Promise<ActionResult> {
  const userId = await requireUserId();
  await prisma.user.update({ where: { id: userId }, data: input });
  revalidatePath("/settings/privacy");
  return { success: true };
}
