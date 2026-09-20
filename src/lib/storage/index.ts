import { getEnv } from "@/config/env";
import { MockStorageProvider } from "./mock-storage-provider";
import { VercelBlobStorageProvider } from "./vercel-blob-storage-provider";
import type { StorageProvider } from "./types";

let provider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (provider) return provider;
  const env = getEnv();
  if (env.STORAGE_PROVIDER === "vercel-blob") {
    provider = new VercelBlobStorageProvider();
    return provider;
  }
  if (env.STORAGE_PROVIDER !== "mock") {
    throw new Error(
      `STORAGE_PROVIDER=${env.STORAGE_PROVIDER} mais aucun provider réel n'est encore implémenté. Voir docs/architecture.md.`,
    );
  }
  provider = new MockStorageProvider();
  return provider;
}

export * from "./types";
