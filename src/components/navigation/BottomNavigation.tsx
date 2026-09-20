"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MAIN_NAV_ITEMS } from "@/constants/navigation";

/** Navigation mobile (section 52) — le scanner reste facilement accessible au pouce. */
export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-cocoa/10 bg-ivory pb-safe-bottom sm:hidden"
    >
      <ul className="flex items-stretch justify-between px-2">
        {MAIN_NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-center text-caption font-semibold leading-tight",
                  active ? "text-leaf" : "text-cocoa/50",
                )}
              >
                <span className="text-h4" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
