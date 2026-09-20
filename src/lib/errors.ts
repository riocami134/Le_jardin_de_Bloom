/**
 * Normalise toute erreur serveur en message chaleureux générique.
 * Ne jamais renvoyer au client : stack traces, messages Prisma, clés API.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly friendlyMessage = "Oups… Bloom n'arrive pas à récupérer ces informations. Réessaie dans quelques instants. 🐰",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toFriendlyMessage(error: unknown): string {
  if (error instanceof AppError) return error.friendlyMessage;
  // eslint-disable-next-line no-console
  console.error(error);
  return "Oups… Bloom n'arrive pas à récupérer ces informations. Réessaie dans quelques instants. 🐰";
}
