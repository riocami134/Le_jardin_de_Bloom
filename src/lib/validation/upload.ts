import { ALLOWED_IMAGE_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@/lib/storage/types";

export function validateImageFile(file: File): { ok: true } | { ok: false; error: string } {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return { ok: false, error: "Format non supporté — utilise une image JPEG, PNG ou WEBP." };
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { ok: false, error: "Cette photo est trop lourde (8 Mo maximum)." };
  }
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !["jpg", "jpeg", "png", "webp"].includes(extension)) {
    return { ok: false, error: "Extension de fichier non reconnue." };
  }
  return { ok: true };
}
