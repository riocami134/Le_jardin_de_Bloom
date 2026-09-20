import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { SITE_CONFIG } from "@/config/site";

export interface MobileHeaderProps {
  userName: string;
}

/** Barre supérieure mobile — seul accès au profil sur téléphone (pas dans la bottom nav). */
export function MobileHeader({ userName }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-cocoa/10 bg-ivory px-4 py-3 sm:hidden">
      <Link href="/" className="font-heading text-h4 text-cocoa">
        🌱 {SITE_CONFIG.name}
      </Link>
      <Link href="/profile" aria-label="Profil">
        <Avatar name={userName} size="sm" />
      </Link>
    </header>
  );
}
