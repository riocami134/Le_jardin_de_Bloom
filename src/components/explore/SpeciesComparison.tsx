"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { PLANT_CATEGORIES } from "@/constants/plant-categories";
import type { PlantSpecies } from "@prisma/client";

export interface SpeciesComparisonProps {
  allSpecies: PlantSpecies[];
}

const ROWS: Array<{ key: keyof PlantSpecies; label: string; icon: string }> = [
  { key: "light", label: "Lumière", icon: "☀️" },
  { key: "watering", label: "Eau", icon: "💧" },
  { key: "difficulty", label: "Difficulté", icon: "🎯" },
  { key: "humidity", label: "Humidité", icon: "💦" },
  { key: "toxicity", label: "Toxicité", icon: "⚠️" },
  { key: "fertilizing", label: "Entretien", icon: "🌸" },
];

export function SpeciesComparison({ allSpecies }: SpeciesComparisonProps) {
  const [idA, setIdA] = useState(allSpecies[0]?.id ?? "");
  const [idB, setIdB] = useState(allSpecies[1]?.id ?? "");

  const speciesA = allSpecies.find((s) => s.id === idA);
  const speciesB = allSpecies.find((s) => s.id === idB);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Select label="Espèce 1" value={idA} onChange={(e) => setIdA(e.target.value)}>
          {allSpecies.map((s) => (
            <option key={s.id} value={s.id}>
              {s.commonName}
            </option>
          ))}
        </Select>
        <Select label="Espèce 2" value={idB} onChange={(e) => setIdB(e.target.value)}>
          {allSpecies.map((s) => (
            <option key={s.id} value={s.id}>
              {s.commonName}
            </option>
          ))}
        </Select>
      </div>

      {speciesA && speciesB && (
        <>
          {/* Desktop : tableau comparatif */}
          <Card className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-small">
              <thead>
                <tr className="border-b border-cocoa/10">
                  <th className="pb-2 text-cocoa/50">Critère</th>
                  <th className="pb-2 text-cocoa">
                    {PLANT_CATEGORIES[speciesA.category].icon} {speciesA.commonName}
                  </th>
                  <th className="pb-2 text-cocoa">
                    {PLANT_CATEGORIES[speciesB.category].icon} {speciesB.commonName}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.key} className="border-b border-cocoa/5 last:border-none">
                    <td className="py-2 text-cocoa/60">
                      {row.icon} {row.label}
                    </td>
                    <td className="py-2 text-cocoa">{String(speciesA[row.key] ?? "—")}</td>
                    <td className="py-2 text-cocoa">{String(speciesB[row.key] ?? "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile : cartes empilées */}
          <div className="space-y-3 sm:hidden">
            {[speciesA, speciesB].map((species) => (
              <Card key={species.id} className="space-y-2">
                <h3 className="font-heading text-h4 text-cocoa">
                  {PLANT_CATEGORIES[species.category].icon} {species.commonName}
                </h3>
                <dl className="space-y-1.5">
                  {ROWS.map((row) => (
                    <div key={row.key} className="flex justify-between gap-2 text-small">
                      <dt className="text-cocoa/60">
                        {row.icon} {row.label}
                      </dt>
                      <dd className="text-right text-cocoa">{String(species[row.key] ?? "—")}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
