import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PLANT_CATEGORIES } from "@/constants/plant-categories";
import { speciesCardTitle } from "@/lib/botanics/clean-species-name";
import type { PlantCategory } from "@prisma/client";

export interface SpeciesCardProps {
  id: string;
  commonName: string;
  scientificName: string;
  category: PlantCategory;
  light: string;
  difficulty: string;
  imageUrl?: string | null;
}

export function SpeciesCard({ id, commonName, scientificName, category, light, difficulty, imageUrl }: SpeciesCardProps) {
  return (
    <Link href={`/explore/${id}`} className="block h-full">
      <Card padded={false} className="flex h-full flex-col overflow-hidden" lift>
        <div className="relative aspect-[4/3] shrink-0 bg-ivory">
          {imageUrl ? (
            <Image src={imageUrl} alt={commonName} fill className="object-cover" sizes="(min-width: 640px) 300px, 50vw" />
          ) : (
            <Image
              src={PLANT_CATEGORIES[category].avatarUrl}
              alt={PLANT_CATEGORIES[category].label}
              fill
              className="object-contain p-4"
              sizes="(min-width: 640px) 300px, 50vw"
            />
          )}
        </div>
        <div className="flex h-[260px] flex-col gap-1.5 overflow-hidden p-4">
          <div>
            <h3 className="line-clamp-3 font-heading text-h4 text-cocoa">{speciesCardTitle(commonName)}</h3>
          </div>
          <div>
            <p className="line-clamp-2 text-caption italic text-cocoa/60">{scientificName}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Badge tone="info" icon={PLANT_CATEGORIES[category].icon}>
              {PLANT_CATEGORIES[category].label}
            </Badge>
            <Badge tone="neutral">{difficulty}</Badge>
          </div>
          <div className="mt-auto pt-1">
            <p className="line-clamp-1 text-caption text-cocoa/60">☀️ {light}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
