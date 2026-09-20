import { prisma } from "@/lib/db/prisma";

/** Toutes ces fonctions filtrent systématiquement par userId — jamais de confiance dans un id seul. */

export async function getUserPlants(userId: string) {
  return prisma.plant.findMany({
    where: { userId, deletedAt: null },
    include: {
      species: true,
      location: true,
      healthAnalyses: { orderBy: { createdAt: "desc" }, take: 1 },
      photos: { orderBy: { takenAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPlantById(userId: string, plantId: string) {
  return prisma.plant.findFirst({
    where: { id: plantId, userId, deletedAt: null },
    include: {
      species: true,
      location: true,
      environment: true,
      photos: { orderBy: { takenAt: "desc" } },
      healthAnalyses: { orderBy: { createdAt: "desc" }, include: { symptoms: true } },
      careActions: {
        orderBy: { performedAt: "desc" },
        include: { wateringEvent: true, fertilizingEvent: true, repottingEvent: true, pruningEvent: true },
      },
      reminders: { where: { status: "pending" }, orderBy: { scheduledFor: "asc" } },
    },
  });
}

export async function getPlantsToWatch(userId: string, limit = 3) {
  return prisma.plant.findMany({
    where: { userId, deletedAt: null, status: { in: ["watch", "attention"] } },
    include: { species: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export async function getRecentAnalyses(userId: string, limit = 3) {
  return prisma.healthAnalysis.findMany({
    where: { plant: { userId, deletedAt: null } },
    include: { plant: { select: { id: true, name: true } }, photo: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
