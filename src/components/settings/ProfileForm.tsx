"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { updateProfileAction } from "@/server/actions/settings-actions";

export function ProfileForm({ name, city }: { name: string; city: string }) {
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await updateProfileAction(formData);
    setPending(false);
    showToast(result.success ? "Profil mis à jour 🌿" : (result.error ?? "Une erreur est survenue"), result.success ? "success" : "error");
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input label="Prénom" name="name" defaultValue={name} required />
      <Input label="Ville" name="city" defaultValue={city} placeholder="Pour la météo de ton jardin" />
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
