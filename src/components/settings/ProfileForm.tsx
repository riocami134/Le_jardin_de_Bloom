"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { CityAutocomplete } from "@/components/onboarding/CityAutocomplete";
import { updateProfileAction } from "@/server/actions/settings-actions";

export function ProfileForm({ name, city }: { name: string; city: string }) {
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);
  const [cityValue, setCityValue] = useState(city);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await updateProfileAction(formData);
    setPending(false);
    showToast(result.success ? "Profil mis à jour 🌿" : (result.error ?? "Une erreur est survenue"), result.success ? "success" : "error");
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input label="Prénom" name="name" defaultValue={name} required />
      <CityAutocomplete value={cityValue} onChange={setCityValue} />
      {/* CityAutocomplete est contrôlé (value/onChange) et n'a pas d'attribut
          name : ce champ caché transmet sa valeur au FormData natif. */}
      <input type="hidden" name="city" value={cityValue} />
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
