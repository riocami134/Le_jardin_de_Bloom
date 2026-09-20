"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { addCareActionAction } from "@/server/actions/plant-actions";
import { CARE_ACTION_LABEL } from "./CareAction";
import type { CareActionType } from "@prisma/client";

const QUICK_TYPES: CareActionType[] = ["watering", "fertilizing", "pruning", "cleaning"];

export function QuickCareActions({ plantId }: { plantId: string }) {
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [pendingType, setPendingType] = useState<CareActionType | null>(null);

  function handleClick(type: CareActionType) {
    setPendingType(type);
    startTransition(async () => {
      const result = await addCareActionAction(plantId, { type });
      if (result.success) {
        showToast(`${CARE_ACTION_LABEL[type].label} enregistré 🌿`, "success");
      } else {
        showToast(result.error ?? "Une erreur est survenue", "error");
      }
      setPendingType(null);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_TYPES.map((type) => (
        <Button
          key={type}
          variant="secondary"
          size="sm"
          onClick={() => handleClick(type)}
          disabled={pending}
        >
          {CARE_ACTION_LABEL[type].icon} {pending && pendingType === type ? "…" : CARE_ACTION_LABEL[type].label}
        </Button>
      ))}
    </div>
  );
}
