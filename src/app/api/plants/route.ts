import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/session";
import { getUserPlants } from "@/server/queries/plants";
import { createPlantSchema } from "@/lib/validation/plant";
import { prisma } from "@/lib/db/prisma";
import { toFriendlyMessage } from "@/lib/errors";

export async function GET() {
  try {
    const userId = await requireUserId();
    const plants = await getUserPlants(userId);
    return NextResponse.json({ plants });
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const parsed = createPlantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Requête invalide" }, { status: 400 });
    }

    const plant = await prisma.plant.create({
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

    return NextResponse.json({ plant }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}
