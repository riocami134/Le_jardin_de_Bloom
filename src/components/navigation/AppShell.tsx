import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNavigation } from "./BottomNavigation";
import { MobileHeader } from "./MobileHeader";

export interface AppShellProps {
  userName: string;
  children: ReactNode;
}

/** Zone connectée : sidebar desktop + bottom navigation mobile + zone principale à largeur maximale. */
export function AppShell({ userName, children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh bg-taupe">
      <Sidebar userName={userName} />
      <div className="flex min-h-dvh flex-1 flex-col">
        <MobileHeader userName={userName} />
        <div className="flex flex-1 justify-center">
          <main className="w-full max-w-3xl px-4 pb-28 pt-6 sm:px-8 sm:pb-10 sm:pt-10">{children}</main>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
