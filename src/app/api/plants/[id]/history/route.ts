import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { toFriendlyMessage } from "@/lib/errors";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await requireUserId();

    const plant = await prisma.plant.findFirst({ where: { id, userId, deletedAt: null } });
    if (!plant) return NextResponse.json({ error: "Plante introuvable" }, { status: 404 });

    const [careActions, healthAnalyses] = await Promise.all([
      prisma.careAction.findMany({
        where: { plantId: id },
        orderBy: { performedAt: "desc" },
        include: { wateringEvent: true, fertilizingEvent: true, repottingEvent: true, pruningEvent: true },
      }),
      prisma.healthAnalysis.findMany({ where: { plantId: id }, orderBy: { createdAt: "desc" } }),
    ]);

    return NextResponse.json({ careActions, healthAnalyses });
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}
