"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createPlantAction } from "@/server/actions/plant-actions";

export interface AddPlantModalProps {
  open: boolean;
  onClose: () => void;
  species: Array<{ id: string; commonName: string; scientificName: string }>;
}

export function AddPlantModal({ open, onClose, species }: AddPlantModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [speciesId, setSpeciesId] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await createPlantAction({
      name,
      speciesId: speciesId || undefined,
      notes: notes || undefined,
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Une erreur est survenue");
      return;
    }

    showToast("Bienvenue à ta nouvelle plante ! 🌱", "success");
    setName("");
    setSpeciesId("");
    setNotes("");
    onClose();
    router.push(`/plants/${result.id}`);
  }

  return (
    <Modal open={open} onClose={onClose} title="Ajouter une plante">
      <div className="space-y-4">
        <Input label="Nom de ta plante" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mon Monstera" required />
        <Select label="Espèce (si connue)" value={speciesId} onChange={(e) => setSpeciesId(e.target.value)}>
          <option value="">Je ne sais pas encore</option>
          {species.map((s) => (
            <option key={s.id} value={s.id}>
              {s.commonName} ({s.scientificName})
            </option>
          ))}
        </Select>
        <Textarea label="Notes (facultatif)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        {error && <p className="text-small text-coral">{error}</p>}
        <Button className="w-full" onClick={handleSubmit} disabled={submitting || !name.trim()}>
          {submitting ? "Ajout…" : "Ajouter au jardin"}
        </Button>
      </div>
    </Modal>
  );
}
