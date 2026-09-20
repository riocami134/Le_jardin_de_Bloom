import type { Metadata } from "next";
import { requireUserId } from "@/lib/auth/session";
import { getUserPlants } from "@/server/queries/plants";
import { getAllSpecies } from "@/server/queries/species";
import { Scanner } from "@/components/scanner/Scanner";

export const metadata: Metadata = { title: "Scanner" };

export default async function ScannerPage() {
  const userId = await requireUserId();
  const [plants, species] = await Promise.all([getUserPlants(userId), getAllSpecies()]);

  const speciesLookup: Record<string, string | undefined> = {};
  for (const s of species) speciesLookup[s.scientificName] = s.id;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-h1 text-ivory sm:text-cocoa">Scanner</h1>
      <Scanner existingPlants={plants.map((p) => ({ id: p.id, name: p.name }))} speciesLookup={speciesLookup} />
    </div>
  );
}
