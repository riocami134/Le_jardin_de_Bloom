"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { CompassPicker } from "./CompassPicker";
import { LocationCard } from "./LocationCard";
import { updatePlantLocationAction } from "@/server/actions/plant-actions";

export interface LocationEditorProps {
  plantId: string;
  initial: {
    name?: string | null;
    room?: string | null;
    indoorOutdoor?: string | null;
    windowOrientation?: string | null;
  } | null;
}

export function LocationEditor({ plantId, initial }: LocationEditorProps) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const [room, setRoom] = useState(initial?.room ?? "");
  const [indoorOutdoor, setIndoorOutdoor] = useState(initial?.indoorOutdoor ?? "interieur");
  const [windowOrientation, setWindowOrientation] = useState<string | undefined>(initial?.windowOrientation ?? undefined);
  const [usedCompassSensor, setUsedCompassSensor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await updatePlantLocationAction(
      plantId,
      { name, room: room || undefined, indoorOutdoor: indoorOutdoor as "interieur" | "exterieur", windowOrientation: windowOrientation as never },
      usedCompassSensor,
    );
    setSubmitting(false);
    if (!result.success) {
      setError(result.error ?? "Une erreur est survenue");
      return;
    }
    showToast("Emplacement enregistré 📍", "success");
    setOpen(false);
  }

  return (
    <>
      {initial?.name ? (
        <button type="button" onClick={() => setOpen(true)} className="w-full text-left">
          <LocationCard
            name={initial.name}
            room={initial.room}
            indoorOutdoor={initial.indoorOutdoor ?? "interieur"}
            windowOrientation={initial.windowOrientation}
          />
        </button>
      ) : (
        <Card className="flex flex-col items-center gap-2 text-center">
          <p className="text-small text-cocoa/60">Aucun emplacement renseigné pour l&apos;instant.</p>
          <Button variant="tertiary" onClick={() => setOpen(true)}>
            🧭 Renseigner l&apos;emplacement
          </Button>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Emplacement de la plante">
        <div className="space-y-4">
          <Input label="Nom du lieu" value={name} onChange={(e) => setName(e.target.value)} placeholder="Salon, chambre..." required />
          <Input label="Pièce (facultatif)" value={room} onChange={(e) => setRoom(e.target.value)} />
          <Select label="Intérieur ou extérieur" value={indoorOutdoor} onChange={(e) => setIndoorOutdoor(e.target.value)}>
            <option value="interieur">Intérieur</option>
            <option value="exterieur">Extérieur</option>
          </Select>
          <div>
            <p className="mb-2 text-small font-semibold text-cocoa">Orientation de la fenêtre</p>
            <CompassPicker
              value={windowOrientation}
              onChange={(orientation, sensor) => {
                setWindowOrientation(orientation);
                setUsedCompassSensor(sensor);
              }}
            />
          </div>
          {error && <p className="text-small text-coral">{error}</p>}
          <Button className="w-full" onClick={handleSubmit} disabled={submitting || !name.trim()}>
            {submitting ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
