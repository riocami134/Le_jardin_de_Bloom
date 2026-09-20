import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getStorageProvider } from "@/lib/storage";
import { validateImageFile } from "@/lib/validation/upload";
import { toFriendlyMessage } from "@/lib/errors";
import { revalidatePath } from "next/cache";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await requireUserId();

    const plant = await prisma.plant.findFirst({ where: { id, userId, deletedAt: null } });
    if (!plant) {
      return NextResponse.json({ error: "Plante introuvable" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucune photo reçue." }, { status: 400 });
    }
    const validation = validateImageFile(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorageProvider();
    const { key } = await storage.upload({ buffer, fileName: file.name, mimeType: file.type, ownerId: userId });

    const photo = await prisma.plantPhoto.create({
      data: { plantId: id, storageKey: key, caption: (formData.get("caption") as string | null) ?? undefined },
    });

    revalidatePath(`/plants/${id}`);
    return NextResponse.json({ photoId: photo.id, url: await storage.getSignedUrl(key) });
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}
