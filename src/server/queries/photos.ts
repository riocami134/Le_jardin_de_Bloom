import { getStorageProvider } from "@/lib/storage";

export async function resolvePhotoUrl(storageKey: string): Promise<string> {
  return getStorageProvider().getSignedUrl(storageKey);
}

export async function resolvePhotoUrls<T extends { storageKey: string }>(
  photos: T[],
): Promise<Array<T & { url: string }>> {
  return Promise.all(photos.map(async (photo) => ({ ...photo, url: await resolvePhotoUrl(photo.storageKey) })));
}
