"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MAIN_NAV_ITEMS } from "@/constants/navigation";
import { SITE_CONFIG } from "@/config/site";

export interface SidebarProps {
  userName: string;
}

/** Navigation desktop (section 53) — Logo, liens principaux, puis Profil. */
export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-cocoa/10 bg-ivory px-5 py-8 sm:flex">
      <Link href="/" className="font-heading text-h3 text-cocoa">
        🌱 {SITE_CONFIG.name}
      </Link>
      <nav aria-label="Navigation principale" className="flex flex-1 flex-col gap-1">
        {MAIN_NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-button px-4 py-3 text-body font-semibold transition-colors",
                active ? "bg-sage text-ivory" : "text-cocoa hover:bg-cocoa/5",
              )}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/profile"
        className={cn(
          "flex items-center gap-3 rounded-button px-4 py-3 text-body font-semibold transition-colors",
          pathname.startsWith("/profile") ? "bg-sage text-ivory" : "text-cocoa hover:bg-cocoa/5",
        )}
      >
        <span aria-hidden="true">👤</span>
        {userName}
      </Link>
    </aside>
  );
}
