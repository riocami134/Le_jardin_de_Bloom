import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isLoggedIn = !!req.auth?.user;

  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isPublic) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

/**
 * Exclut aussi bien les dossiers connus (bloom/, illustrations/, uploads/…)
 * que N'IMPORTE QUEL fichier statique à la racine de public/ (icônes,
 * manifest, favicon…) via son extension — sinon un navigateur non connecté
 * se voit rediriger vers /login au lieu de recevoir l'asset (ex. les icônes
 * du manifest PWA échouaient silencieusement avant ce correctif).
 */
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|bloom/|plants/placeholder|icons/|illustrations/|uploads/|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|webmanifest|json|txt|xml)$).*)",
  ],
};
