import { Badge } from "@/components/ui/Badge";
import type { GardenSeason as GardenSeasonType } from "@prisma/client";

const SEASON_META: Record<GardenSeasonType, { label: string; icon: string }> = {
  spring: { label: "Printemps", icon: "🌷" },
  summer: { label: "Été", icon: "🌻" },
  autumn: { label: "Automne", icon: "🍂" },
  winter: { label: "Hiver", icon: "❄️" },
};

export function GardenSeason({ season }: { season: GardenSeasonType }) {
  return (
    <Badge tone="info" icon={SEASON_META[season].icon}>
      {SEASON_META[season].label}
    </Badge>
  );
}

export function currentSeasonFromDate(date: Date = new Date()): GardenSeasonType {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}
