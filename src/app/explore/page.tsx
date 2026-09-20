import Link from "next/link";
import type { Metadata } from "next";
import { searchSpecies } from "@/server/queries/species";
import { parseNaturalSearch } from "@/lib/botanics/natural-search";
import { speciesSearchSchema } from "@/lib/validation/species";
import { SpeciesCard } from "@/components/explore/SpeciesCard";
import { ExploreFilters } from "@/components/explore/ExploreFilters";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Explorer",
  description: "Découvre de nouvelles espèces de plantes et trouve celle qui te correspond.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const naturalFilters = params.query ? parseNaturalSearch(params.query) : {};

  const parsed = speciesSearchSchema.safeParse({
    query: params.query,
    category: params.category ?? naturalFilters.category,
    difficulty: naturalFilters.difficulty,
    petSafe: params.petSafe,
  });

  const species = await searchSpecies(parsed.success ? parsed.data : {});

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-heading text-h1 text-ivory sm:text-cocoa">Explorer</h1>
        <p className="text-small text-ivory/80 sm:text-cocoa/60">
          Découvre de nouvelles plantes et trouve celle qui te correspond.
        </p>
      </header>

      <ExploreFilters />

      {species.length === 0 ? (
        <EmptyState
          title="Aucune plante ne correspond à ta recherche"
          description="Essaie d'autres mots-clés ou retire un filtre."
          bloomEmotion="surprised"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {species.map((s) => (
              <SpeciesCard
                key={s.id}
                id={s.id}
                commonName={s.commonName}
                scientificName={s.scientificName}
                category={s.category}
                light={s.light}
                difficulty={s.difficulty}
                imageUrl={s.imageUrl}
              />
            ))}
          </div>
          <div className="flex justify-center">
            <Link href="/explore/compare">
              <Button variant="tertiary">Comparer deux espèces</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
