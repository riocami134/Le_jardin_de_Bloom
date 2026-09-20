export interface StorageProvider {
  /** Stocke un fichier (buffer) et retourne sa clé objet privée. */
  upload(input: { buffer: Buffer; fileName: string; mimeType: string; ownerId: string }): Promise<{ key: string }>;
  /** Retourne une URL temporaire pour afficher le fichier (jamais permanente/publique). */
  getSignedUrl(key: string): Promise<string>;
  /** Supprime un fichier stocké. */
  delete(key: string): Promise<void>;
}

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024; // 8 Mo
