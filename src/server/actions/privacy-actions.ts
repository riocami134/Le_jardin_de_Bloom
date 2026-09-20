"use server";

import { revalidatePath } from "next/cache";
import { signOut } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/session";
import { getStorageProvider } from "@/lib/storage";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/** Exporte toutes les données de l'utilisateur au format JSON (RGPD, section 37). */
export async function exportUserDataAction(): Promise<{ success: true; data: string } | { success: false; error: string }> {
  const userId = await requireUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      plants: {
        include: { species: true, location: true, environment: true, photos: true, healthAnalyses: true, careActions: true },
      },
      reminders: true,
      achievements: { include: { achievement: true } },
    },
  });

  if (!user) return { success: false, error: "Utilisateur introuvable" };

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return { success: true, data: JSON.stringify(safeUser, null, 2) };
}

/** Supprime toutes les photos de l'utilisateur (stockage + base). */
export async function deleteAllPhotosAction(): Promise<ActionResult> {
  const userId = await requireUserId();
  const storage = getStorageProvider();

  const photos = await prisma.plantPhoto.findMany({ where: { plant: { userId } } });
  await Promise.all(photos.map((p) => storage.delete(p.storageKey)));
  await prisma.plantPhoto.deleteMany({ where: { plant: { userId } } });

  revalidatePath("/settings/privacy");
  return { success: true };
}

/** Supprime l'historique de soins et d'analyses (conserve les plantes elles-mêmes). */
export async function deleteHistoryAction(): Promise<ActionResult> {
  const userId = await requireUserId();
  await prisma.$transaction([
    prisma.careAction.deleteMany({ where: { plant: { userId } } }),
    prisma.healthAnalysis.deleteMany({ where: { plant: { userId } } }),
  ]);
  revalidatePath("/settings/privacy");
  return { success: true };
}

/** Supprime définitivement le compte et toutes les données associées. */
export async function deleteAccountAction(): Promise<ActionResult> {
  const userId = await requireUserId();
  const storage = getStorageProvider();

  const photos = await prisma.plantPhoto.findMany({ where: { plant: { userId } } });
  await Promise.all(photos.map((p) => storage.delete(p.storageKey)));

  await prisma.user.delete({ where: { id: userId } });
  await signOut({ redirectTo: "/register" });

  return { success: true };
}
