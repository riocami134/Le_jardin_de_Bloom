import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { requireUserId } from "@/lib/auth/session";
import { getPlantById } from "@/server/queries/plants";
import { resolvePhotoUrl } from "@/server/queries/photos";
import { recommendationEngine } from "@/server/services/recommendation-engine";
import { bloomService } from "@/server/services/bloom-service";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { PlantHealthCard } from "@/components/plants/PlantHealthCard";
import { EnvironmentCard } from "@/components/plants/EnvironmentCard";
import { LocationEditor } from "@/components/plants/LocationEditor";
import { CareHistory } from "@/components/plants/CareHistory";
import { PlantTimeline, type TimelineEntry } from "@/components/plants/PlantTimeline";
import { PlantPhoto } from "@/components/plants/PlantPhoto";
import { QuickCareActions } from "@/components/plants/QuickCareActions";
import { DeletePlantButton } from "@/components/plants/DeletePlantButton";
import { BloomAdvice } from "@/components/bloom/BloomAdvice";
import { PLANT_STATUS } from "@/constants/plant-status";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const userId = await requireUserId();
  const plant = await getPlantById(userId, id);
  return { title: plant?.name ?? "Plante" };
}

export default async function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  const plant = await getPlantById(userId, id);

  if (!plant) notFound();

  const photosWithUrls = await Promise.all(
    plant.photos.map(async (photo) => ({ ...photo, url: await resolvePhotoUrl(photo.storageKey) })),
  );
  const heroUrl = photosWithUrls[0]?.url ?? plant.species?.imageUrl ?? null;

  const scoreHistory = [...plant.healthAnalyses].reverse().map((a) => a.score);
  const lastWatering = plant.careActions.find((a) => a.type === "watering");
  const lastWateredDaysAgo = lastWatering
    ? Math.floor((Date.now() - new Date(lastWatering.performedAt).getTime()) / (1000 * 60 * 60 * 24))
    : undefined;

  let recentHealthTrend: "improving" | "declining" | "stable" | undefined;
  if (scoreHistory.length >= 2) {
    const diff = scoreHistory[scoreHistory.length - 1]! - scoreHistory[scoreHistory.length - 2]!;
    recentHealthTrend = diff > 3 ? "improving" : diff < -3 ? "declining" : "stable";
  }

  const recommendation = recommendationEngine.build({
    plantStatus: plant.status,
    lastWateredDaysAgo,
    speciesWateringNote: plant.species?.watering,
    indoorOutdoor: plant.location?.indoorOutdoor as "interieur" | "exterieur" | undefined,
    recentHealthTrend,
  });

  const bloomMessage = await bloomService.getMessage({ plantName: plant.name });

  const timelineEntries: TimelineEntry[] = [
    ...plant.careActions.map((a) => ({ kind: "care" as const, id: a.id, type: a.type, date: a.performedAt, note: a.note })),
    ...plant.healthAnalyses.map((h) => ({ kind: "analysis" as const, id: h.id, date: h.createdAt, score: h.score })),
  ];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-card bg-ivory shadow-soft">
        <div className="relative aspect-[16/9] bg-peach-light">
          {heroUrl ? (
            <Image src={heroUrl} alt={plant.name} fill className="object-cover" priority />
          ) : (
            <div className="flex h-full items-center justify-center text-h1" aria-hidden="true">
              🌿
            </div>
          )}
        </div>
        <div className="space-y-2 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-h2 text-cocoa">{plant.name}</h1>
            <Badge tone={plant.status === "attention" ? "attention" : plant.status === "watch" ? "watch" : plant.status === "healthy" ? "success" : "neutral"} icon={PLANT_STATUS[plant.status].icon}>
              {PLANT_STATUS[plant.status].label}
            </Badge>
          </div>
          {plant.species && <p className="text-small italic text-cocoa/60">{plant.species.commonName} · {plant.species.scientificName}</p>}
          <QuickCareActions plantId={plant.id} />
        </div>
      </div>

      <BloomAdvice recommendation={recommendation} emotion={bloomMessage.emotion} />

      <Tabs
        items={[
          {
            id: "sante",
            label: "Santé",
            content: <PlantHealthCard status={plant.status} score={plant.healthScore} scoreHistory={scoreHistory} />,
          },
          {
            id: "environnement",
            label: "Environnement",
            content: (
              <div className="space-y-4">
                <LocationEditor
                  plantId={plant.id}
                  initial={
                    plant.location
                      ? {
                          name: plant.location.name,
                          room: plant.location.room,
                          indoorOutdoor: plant.location.indoorOutdoor,
                          windowOrientation: plant.location.windowOrientation,
                        }
                      : null
                  }
                />
                {plant.environment && (
                  <EnvironmentCard
                    temperatureC={plant.environment.temperatureC}
                    humidityPct={plant.environment.humidityPct}
                    lightDescription={plant.environment.lightDescription}
                    notes={plant.environment.notes}
                  />
                )}
              </div>
            ),
          },
          {
            id: "historique",
            label: "Historique",
            content: (
              <div className="space-y-4">
                <PlantTimeline entries={timelineEntries} />
                <CareHistory
                  items={plant.careActions.map((a) => ({ id: a.id, type: a.type, performedAt: a.performedAt, note: a.note }))}
                />
              </div>
            ),
          },
          {
            id: "photos",
            label: "Photos",
            content:
              photosWithUrls.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {photosWithUrls.map((photo) => (
                    <PlantPhoto key={photo.id} url={photo.url} alt={plant.name} caption={new Date(photo.takenAt).toLocaleDateString("fr-FR")} />
                  ))}
                </div>
              ) : (
                <Card>
                  <p className="text-small text-cocoa/60">Aucune photo pour le moment — scanne cette plante pour en ajouter une.</p>
                </Card>
              ),
          },
        ]}
      />

      <div className="flex justify-end">
        <DeletePlantButton plantId={plant.id} plantName={plant.name} />
      </div>
    </div>
  );
}
