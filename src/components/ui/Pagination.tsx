import Link from "next/link";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  page: number;
  totalPages: number;
  /** Construit l'URL d'une page donnée à partir des filtres actuels. */
  buildHref: (page: number) => string;
}

export function Pagination({ page, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav className="flex items-center justify-center gap-3" aria-label="Pagination">
      <PaginationLink href={buildHref(page - 1)} disabled={prevDisabled} aria-label="Page précédente">
        ← Précédent
      </PaginationLink>
      <span className="text-small text-cocoa/70">
        Page {page} / {totalPages}
      </span>
      <PaginationLink href={buildHref(page + 1)} disabled={nextDisabled} aria-label="Page suivante">
        Suivant →
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  href,
  disabled,
  children,
  ...props
}: { href: string; disabled: boolean; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const className = cn(
    "rounded-pill px-4 py-2 text-small font-semibold transition-colors",
    disabled ? "pointer-events-none bg-cocoa/10 text-cocoa/30" : "bg-ivory text-cocoa shadow-soft hover:bg-honey/30",
  );
  if (disabled) {
    return (
      <span className={className} aria-disabled="true">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}
