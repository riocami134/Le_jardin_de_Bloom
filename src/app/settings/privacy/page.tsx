import type { Metadata } from "next";
import { requireUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PrivacyPanel } from "@/components/settings/PrivacyPanel";

export const metadata: Metadata = { title: "Confidentialité & données" };

export default async function PrivacyPage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-h1 text-ivory sm:text-cocoa">Confidentialité &amp; données</h1>
      <PrivacyPanel consentLocation={user.consentLocation} consentNotifications={user.consentNotifications} />
    </div>
  );
}
