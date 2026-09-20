import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getWeatherProvider } from "@/lib/weather";
import { toFriendlyMessage } from "@/lib/errors";

export async function GET() {
  try {
    const userId = await requireUserId();
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.city) {
      return NextResponse.json({ error: "Aucune ville renseignée pour ton profil." }, { status: 400 });
    }
    const weather = await getWeatherProvider().getWeatherContext({ city: user.city });
    return NextResponse.json({ weather });
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}
