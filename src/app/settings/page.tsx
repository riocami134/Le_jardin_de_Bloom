import Link from "next/link";
import type { Metadata } from "next";
import { requireUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/Card";
import { ProfileForm } from "@/components/settings/ProfileForm";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-h1 text-ivory sm:text-cocoa">Paramètres</h1>

      <Card>
        <h2 className="font-heading text-h4 text-cocoa">Ton profil</h2>
        <div className="mt-3">
          <ProfileForm name={user.name ?? ""} city={user.city ?? ""} />
        </div>
      </Card>

      <Link href="/settings/privacy" className="mt-4 block">
        <Card padded className="flex items-center justify-between !py-3">
          <span className="text-body text-cocoa">🔒 Confidentialité &amp; données (RGPD)</span>
          <span aria-hidden="true">→</span>
        </Card>
      </Link>
    </div>
  );
}
