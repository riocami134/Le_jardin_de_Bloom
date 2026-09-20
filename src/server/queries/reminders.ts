import { prisma } from "@/lib/db/prisma";

export async function getTodayReminders(userId: string, limit = 5) {
  return prisma.reminder.findMany({
    where: { userId, status: "pending" },
    include: { plant: { select: { id: true, name: true } } },
    orderBy: { scheduledFor: "asc" },
    take: limit,
  });
}
