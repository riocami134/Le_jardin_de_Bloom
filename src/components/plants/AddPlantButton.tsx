"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AddPlantModal } from "./AddPlantModal";

export function AddPlantButton({ species }: { species: Array<{ id: string; commonName: string; scientificName: string }> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Ajouter une plante</Button>
      <AddPlantModal open={open} onClose={() => setOpen(false)} species={species} />
    </>
  );
}
