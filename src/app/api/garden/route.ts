import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/session";
import { getVirtualGarden } from "@/server/queries/garden";
import { toFriendlyMessage } from "@/lib/errors";

export async function GET() {
  try {
    const userId = await requireUserId();
    const garden = await getVirtualGarden(userId);
    return NextResponse.json({ garden });
  } catch (error) {
    return NextResponse.json({ error: toFriendlyMessage(error) }, { status: 500 });
  }
}
