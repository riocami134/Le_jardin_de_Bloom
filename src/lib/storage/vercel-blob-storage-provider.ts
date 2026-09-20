import { randomUUID } from "node:crypto";
import path from "node:path";
import { put, del } from "@vercel/blob";
import type { StorageProvider } from "./types";

/**
 * Stockage de production basé sur Vercel Blob. Aucune inscription tierce :
 * il suffit d'activer un "Blob store" dans l'onglet Storage du projet
 * Vercel, qui injecte automatiquement BLOB_READ_WRITE_TOKEN. Contrairement
 * au mock (écriture disque locale), fonctionne sur le système de fichiers
 * en lecture seule des fonctions serverless Vercel.
 *
 * Les URLs Vercel Blob sont publiques mais non énumérables (suffixe
 * aléatoire), donc `key` stocke directement l'URL complète et
 * `getSignedUrl` la retourne telle quelle plutôt que de générer une vraie
 * signature temporaire (Vercel Blob ne propose pas d'URLs privées côté
 * plan gratuit/hobby).
 */
export class VercelBlobStorageProvider implements StorageProvider {
  async upload({
    buffer,
    fileName,
    mimeType,
    ownerId,
  }: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
    ownerId: string;
  }): Promise<{ key: string }> {
    const ext = path.extname(fileName) || ".jpg";
    const pathname = `${ownerId}/${randomUUID()}${ext}`;
    const blob = await put(pathname, buffer, {
      access: "public",
      contentType: mimeType,
      addRandomSuffix: false,
    });
    return { key: blob.url };
  }

  async getSignedUrl(key: string): Promise<string> {
    if (key.startsWith("demo:")) {
      return key.slice("demo:".length);
    }
    return key;
  }

  async delete(key: string): Promise<void> {
    if (key.startsWith("demo:")) return;
    try {
      await del(key);
    } catch {
      // fichier déjà absent — pas bloquant pour une suppression utilisateur
    }
  }
}
