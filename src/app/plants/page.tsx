import type { Metadata } from "next";
import { requireUserId } from "@/lib/auth/session";
import { getUserPlants } from "@/server/queries/plants";
import { getAllSpecies } from "@/server/queries/species";
import { resolvePhotoUrl } from "@/server/queries/photos";
import { PlantCard } from "@/components/plants/PlantCard";
import { AddPlantButton } from "@/components/plants/AddPlantButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { BloomCharacter } from "@/components/bloom/BloomCharacter";

export const metadata: Metadata = { title: "Mes plantes" };

export default async function PlantsPage() {
  const userId = await requireUserId();
  const [plants, species] = await Promise.all([getUserPlants(userId), getAllSpecies()]);

  const plantsWithPhotos = await Promise.all(
    plants.map(async (plant) => {
      const firstPhoto = plant.photos[0];
      const photoUrl = firstPhoto ? await resolvePhotoUrl(firstPhoto.storageKey) : (plant.species?.imageUrl ?? null);
      return { ...plant, photoUrl };
    }),
  );

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BloomCharacter emotion="happy" size="sm" />
          <h1 className="font-heading text-h1 text-ivory sm:text-cocoa">Mes plantes</h1>
        </div>
        <AddPlantButton species={species.map((s) => ({ id: s.id, commonName: s.commonName, scientificName: s.scientificName }))} />
      </header>

      {plantsWithPhotos.length === 0 ? (
        <EmptyState
          title="Ton jardin est encore tout petit…"
          description="On commence par planter quelque chose ? 🌱"
          bloomEmotion="happy"
          action={
            <AddPlantButton species={species.map((s) => ({ id: s.id, commonName: s.commonName, scientificName: s.scientificName }))} />
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {plantsWithPhotos.map((plant) => (
            <PlantCard
              key={plant.id}
              id={plant.id}
              name={plant.name}
              speciesCommonName={plant.species?.commonName}
              status={plant.status}
              healthScore={plant.healthScore}
              photoUrl={plant.photoUrl}
              locationName={plant.location?.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
