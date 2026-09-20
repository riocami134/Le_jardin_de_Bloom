import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CareActionItem } from "./CareAction";
import type { CareActionType } from "@prisma/client";

export interface CareHistoryItem {
  id: string;
  type: CareActionType;
  performedAt: Date | string;
  note?: string | null;
}

export function CareHistory({ items }: { items: CareHistoryItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Aucun soin enregistré pour l'instant"
        description="Enregistre un arrosage ou un autre soin pour commencer l'historique."
        bloomEmotion="neutral"
      />
    );
  }

  return (
    <Card>
      {items.map((item) => (
        <CareActionItem key={item.id} type={item.type} performedAt={item.performedAt} note={item.note} />
      ))}
    </Card>
  );
}
