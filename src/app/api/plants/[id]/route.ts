import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/session";
import { getPlantById } from "@/server/queries/plants";
import { updatePlantSchema } from "@/lib/validation/plant";
import { prisma } from "@/lib/db/prisma";
import { toFriendlyMessage } from "@/lib/errors";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await requireUserId();
    const plant = await getPlantById(userId, id);
    if (!plant) return NextResponse.json({ error: "Plante introuvable" }, { status: 404 });
    return NextResponse.json({ plant });
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await requireUserId();
    const existing = await prisma.plant.findFirst({ where: { id, userId, deletedAt: null } });
    if (!existing) return NextResponse.json({ error: "Plante introuvable" }, { status: 404 });

    const body = await request.json();
    const parsed = updatePlantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Requête invalide" }, { status: 400 });
    }

    const plant = await prisma.plant.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ plant });
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await requireUserId();
    const existing = await prisma.plant.findFirst({ where: { id, userId, deletedAt: null } });
    if (!existing) return NextResponse.json({ error: "Plante introuvable" }, { status: 404 });

    await prisma.plant.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}
