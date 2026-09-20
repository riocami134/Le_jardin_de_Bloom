import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { sendBloomMessageSchema } from "@/lib/validation/bloom";
import { bloomService } from "@/server/services/bloom-service";
import { toFriendlyMessage } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const parsed = sendBloomMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Requête invalide" }, { status: 400 });
    }

    let plantName = "ton jardin";
    if (parsed.data.plantId) {
      const plant = await prisma.plant.findFirst({ where: { id: parsed.data.plantId, userId } });
      if (plant) plantName = plant.name;
    }

    const conversation = parsed.data.conversationId
      ? await prisma.conversation.findFirst({ where: { id: parsed.data.conversationId, userId } })
      : await prisma.conversation.create({ data: { userId, plantId: parsed.data.plantId, context: "advice" } });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });
    }

    const bloomReply = await bloomService.getMessage({ plantName });

    await prisma.conversationMessage.createMany({
      data: [
        { conversationId: conversation.id, role: "user", content: parsed.data.content },
        { conversationId: conversation.id, role: "bloom", content: bloomReply.message, emotion: bloomReply.emotion },
      ],
    });
    await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });

    return NextResponse.json({ conversationId: conversation.id, reply: bloomReply });
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}
