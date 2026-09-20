import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PLANT_CATEGORIES } from "@/constants/plant-categories";
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
    <Link href={`/explore/${id}`}>
      <Card padded={false} className="overflow-hidden" lift>
        <div className="relative aspect-[4/3] bg-sky/30">
          {imageUrl ? (
            <Image src={imageUrl} alt={commonName} fill className="object-cover" sizes="(min-width: 640px) 300px, 50vw" />
          ) : (
            <div className="flex h-full items-center justify-center text-h1" aria-hidden="true">
              {PLANT_CATEGORIES[category].icon}
            </div>
          )}
        </div>
        <div className="space-y-1.5 p-4">
          <h3 className="font-heading text-h4 text-cocoa">{commonName}</h3>
          <p className="text-caption italic text-cocoa/60">{scientificName}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Badge tone="info" icon={PLANT_CATEGORIES[category].icon}>
              {PLANT_CATEGORIES[category].label}
            </Badge>
            <Badge tone="neutral">{difficulty}</Badge>
          </div>
          <p className="pt-1 text-caption text-cocoa/60">☀️ {light}</p>
        </div>
      </Card>
    </Link>
  );
}
