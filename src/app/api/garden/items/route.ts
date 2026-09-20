import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { toFriendlyMessage } from "@/lib/errors";

const createGardenItemSchema = z.object({
  plantId: z.string().cuid().optional(),
  type: z.enum(["sprout", "flower", "shrub", "tree", "decoration"]),
  originAction: z.string().max(60).optional(),
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const parsed = createGardenItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Requête invalide" }, { status: 400 });
    }

    if (parsed.data.plantId) {
      const plant = await prisma.plant.findFirst({ where: { id: parsed.data.plantId, userId } });
      if (!plant) return NextResponse.json({ error: "Plante introuvable" }, { status: 404 });
    }

    const garden = await prisma.virtualGarden.upsert({ where: { userId }, update: {}, create: { userId } });
    const item = await prisma.gardenItem.create({
      data: { virtualGardenId: garden.id, plantId: parsed.data.plantId, type: parsed.data.type, originAction: parsed.data.originAction },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}
