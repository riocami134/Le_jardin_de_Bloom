import type { Metadata } from "next";
import { getAllSpecies } from "@/server/queries/species";
import { SpeciesComparison } from "@/components/explore/SpeciesComparison";

export const metadata: Metadata = { title: "Comparer des espèces" };

export default async function ComparePage() {
  const allSpecies = await getAllSpecies();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-h1 text-ivory sm:text-cocoa">Comparer deux espèces</h1>
      <SpeciesComparison allSpecies={allSpecies} />
    </div>
  );
}
