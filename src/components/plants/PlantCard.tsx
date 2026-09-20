import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PLANT_STATUS } from "@/constants/plant-status";
import type { PlantStatus } from "@prisma/client";

export interface PlantCardProps {
  id: string;
  name: string;
  speciesCommonName?: string | null;
  status: PlantStatus;
  healthScore?: number | null;
  photoUrl?: string | null;
  locationName?: string | null;
  nextAction?: string | null;
}

/** Carte de la liste "Mes plantes" (section 13). */
export function PlantCard({ id, name, speciesCommonName, status, healthScore, photoUrl, locationName, nextAction }: PlantCardProps) {
  return (
    <Link href={`/plants/${id}`} className="block">
      <Card padded={false} className="overflow-hidden" lift>
        <div className="relative aspect-[4/3] bg-peach-light">
          {photoUrl ? (
            <Image src={photoUrl} alt={name} fill className="object-cover" sizes="(min-width: 640px) 300px, 50vw" />
          ) : (
            <div className="flex h-full items-center justify-center text-h1" aria-hidden="true">
              🌿
            </div>
          )}
          <Badge tone={status === "attention" ? "attention" : status === "watch" ? "watch" : status === "healthy" ? "success" : "neutral"} icon={PLANT_STATUS[status].icon} className="absolute left-2 top-2">
            {PLANT_STATUS[status].label}
          </Badge>
        </div>
        <div className="space-y-1 p-4">
          <h3 className="font-heading text-h4 text-cocoa">{name}</h3>
          {speciesCommonName && <p className="text-caption italic text-cocoa/60">{speciesCommonName}</p>}
          <div className="flex items-center justify-between pt-1 text-caption text-cocoa/70">
            {typeof healthScore === "number" && <span>{healthScore}/100</span>}
            {locationName && <span>📍 {locationName}</span>}
          </div>
          {nextAction && <p className="pt-1 text-caption text-cocoa/70">{nextAction}</p>}
        </div>
      </Card>
    </Link>
  );
}
