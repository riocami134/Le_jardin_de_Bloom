import Image from "next/image";
import { GardenItem } from "./GardenItem";
import { GardenSeason } from "./GardenSeason";
import { EmptyState } from "@/components/ui/EmptyState";
import type { GardenSeason as GardenSeasonType } from "@prisma/client";

export interface GardenProps {
  season: GardenSeasonType;
  level: number;
  items: Array<{ id: string; type: string; growthStage: number; plantName?: string | null }>;
}

/** Vue du jardin virtuel — responsive : grille simplifiée mobile, plus large en desktop (section 32). */
export function Garden({ season, level, items }: GardenProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Ton jardin virtuel n'attend que toi"
        description="Ajoute une plante ou prends-en soin pour voir ton jardin s'éveiller."
        bloomEmotion="excited"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-card">
        <Image
          src="/illustrations/garden-hero.jpg"
          alt="Illustration du jardin de Bloom"
          width={1536}
          height={1024}
          className="h-40 w-full object-cover sm:h-56"
          priority
        />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <GardenSeason season={season} />
        </div>
      </div>

      <p className="text-small text-ivory/80 sm:text-cocoa/60">Niveau {level} · {items.length} éléments</p>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {items.map((item) => (
          <GardenItem key={item.id} type={item.type} growthStage={item.growthStage} label={item.plantName ?? undefined} />
        ))}
      </div>
    </div>
  );
}
