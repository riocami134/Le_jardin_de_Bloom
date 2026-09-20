import Link from "next/link";
import type { Metadata } from "next";
import { requireUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getGardenSummary, getUserAchievements } from "@/server/queries/garden";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/server/actions/auth-actions";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const userId = await requireUserId();
  const [user, gardenSummary, achievements] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    getGardenSummary(userId),
    getUserAchievements(userId),
  ]);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      <Card className="flex items-center gap-4">
        <Avatar name={user.name ?? user.email} size="lg" />
        <div>
          <h1 className="font-heading text-h3 text-cocoa">{user.name ?? "Toi"}</h1>
          <p className="text-small text-cocoa/60">{user.email}</p>
          {user.city && <p className="text-caption text-cocoa/50">📍 {user.city}</p>}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="font-heading text-h2 text-cocoa">{gardenSummary.total}</p>
          <p className="text-caption text-cocoa/60">Plantes</p>
        </Card>
        <Card className="text-center">
          <p className="font-heading text-h2 text-cocoa">{unlockedCount}</p>
          <p className="text-caption text-cocoa/60">Badges débloqués</p>
        </Card>
      </div>

      <div className="space-y-2">
        <Link href="/settings">
          <Card padded className="flex items-center justify-between !py-3">
            <span className="text-body text-cocoa">⚙️ Paramètres</span>
            <span aria-hidden="true">→</span>
          </Card>
        </Link>
        <Link href="/settings/privacy">
          <Card padded className="flex items-center justify-between !py-3">
            <span className="text-body text-cocoa">🔒 Confidentialité &amp; données</span>
            <span aria-hidden="true">→</span>
          </Card>
        </Link>
      </div>

      <form action={logoutAction}>
        <Button type="submit" variant="ghost" className="w-full">
          Se déconnecter
        </Button>
      </form>
    </div>
  );
}
