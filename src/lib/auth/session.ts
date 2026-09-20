import { auth } from "@/lib/auth";

/**
 * Récupère l'utilisateur courant côté serveur, ou lève. À utiliser dans
 * toutes les queries/actions qui touchent des données utilisateur — ne
 * jamais faire confiance à un userId transmis par le client (section 72).
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }
  return session.user.id;
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
