import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import type { StorageProvider } from "./types";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Stockage local (dev uniquement) — écrit dans public/uploads.
 * Respecte StorageProvider : remplaçable par un vrai provider S3/Supabase
 * sans changer l'UI ni les server actions qui l'utilisent.
 *
 * Les clés préfixées "demo:" servent aux données de démonstration : elles
 * pointent directement vers un asset bundlé dans public/ (voir prisma/seed.ts)
 * plutôt que vers un vrai fichier uploadé.
 */
export class MockStorageProvider implements StorageProvider {
  async upload({ buffer, fileName, ownerId }: { buffer: Buffer; fileName: string; mimeType: string; ownerId: string }) {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext = path.extname(fileName) || ".jpg";
    const key = `${ownerId}/${randomUUID()}${ext}`;
    await mkdir(path.join(UPLOAD_DIR, ownerId), { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, key), buffer);
    return { key };
  }

  async getSignedUrl(key: string): Promise<string> {
    if (key.startsWith("demo:")) {
      return key.slice("demo:".length);
    }
    // Stockage local mock : pas de vraie signature, juste le chemin public.
    return `/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    if (key.startsWith("demo:")) return;
    try {
      await unlink(path.join(UPLOAD_DIR, key));
    } catch {
      // fichier déjà absent — pas bloquant pour une suppression utilisateur
    }
  }
}
