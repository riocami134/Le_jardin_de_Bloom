import { prisma } from "@/lib/db/prisma";

export async function getGardenSummary(userId: string) {
  const plants = await prisma.plant.findMany({
    where: { userId, deletedAt: null },
    select: { status: true },
  });

  return {
    total: plants.length,
    healthy: plants.filter((p) => p.status === "healthy").length,
    watch: plants.filter((p) => p.status === "watch").length,
    attention: plants.filter((p) => p.status === "attention").length,
    unknown: plants.filter((p) => p.status === "unknown").length,
  };
}

export async function getVirtualGarden(userId: string) {
  return prisma.virtualGarden.findUnique({
    where: { userId },
    include: {
      items: { include: { plant: { select: { id: true, name: true } } }, orderBy: { unlockedAt: "desc" } },
    },
  });
}

export async function getUserAchievements(userId: string) {
  const [allAchievements, unlocked] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.userAchievement.findMany({ where: { userId } }),
  ]);
  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));

  return allAchievements.map((achievement) => ({
    ...achievement,
    unlocked: unlockedIds.has(achievement.id),
    unlockedAt: unlocked.find((u) => u.achievementId === achievement.id)?.unlockedAt,
  }));
}
