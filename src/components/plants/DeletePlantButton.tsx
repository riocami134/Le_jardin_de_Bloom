"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { deletePlantAction } from "@/server/actions/plant-actions";

export function DeletePlantButton({ plantId, plantName }: { plantId: string; plantName: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePlantAction(plantId);
      if (result.success) {
        showToast(`${plantName} a été retirée de ton jardin`, "info");
        router.push("/plants");
        router.refresh();
      } else {
        showToast(result.error ?? "Une erreur est survenue", "error");
      }
    });
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Supprimer cette plante
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Supprimer cette plante ?">
        <p className="text-small text-cocoa/70">
          {plantName} sera retirée de ton jardin. Cette action peut être annulée en nous contactant, mais elle
          disparaîtra de ta liste immédiatement.
        </p>
        <div className="mt-4 flex gap-3">
          <Button variant="tertiary" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={pending}>
            {pending ? "Suppression…" : "Confirmer"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
