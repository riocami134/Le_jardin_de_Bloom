import type { ReactNode } from "react";
import { BloomCharacter } from "@/components/bloom/BloomCharacter";
import { SITE_CONFIG } from "@/config/site";

export interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Habillage partagé login/register — pitch produit + Bloom (contenu public). */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-taupe px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center text-ivory">
          <BloomCharacter emotion="happy" size="lg" animated />
          <div>
            <p className="text-small font-semibold uppercase tracking-wide text-ivory/80">
              {SITE_CONFIG.tagline}
            </p>
            <h1 className="font-heading text-h1">{SITE_CONFIG.name}</h1>
          </div>
        </div>

        <div className="rounded-card bg-ivory p-6 shadow-lift sm:p-8">
          <h2 className="font-heading text-h3 text-cocoa">{title}</h2>
          {subtitle && <p className="mt-1 text-small text-cocoa/70">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="text-center text-small text-ivory/90">{footer}</div>}
      </div>
    </div>
  );
}
