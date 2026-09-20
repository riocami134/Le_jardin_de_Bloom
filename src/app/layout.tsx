import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import { bodyFont, headingFont } from "./fonts";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/navigation/AppShell";
import { ToastProvider } from "@/components/ui/Toast";
import { SITE_CONFIG } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: { default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`, template: `%s · ${SITE_CONFIG.name}` },
  description: SITE_CONFIG.description,
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    type: "website",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#A27E6F",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <html lang="fr" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body className="font-body antialiased">
        <ToastProvider>
          {session?.user ? (
            <AppShell userName={session.user.name ?? "Toi"}>{children}</AppShell>
          ) : (
            children
          )}
        </ToastProvider>
      </body>
    </html>
  );
}
