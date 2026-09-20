"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { PLANT_CATEGORY_LIST } from "@/constants/plant-categories";

export function ExploreFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") ?? "");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/explore?${params.toString()}`);
  }

  const activeCategory = searchParams.get("category");
  const petSafeOnly = searchParams.get("petSafe") === "true";

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParam("query", query || null);
        }}
      >
        <Input
          placeholder="« plante facile avec peu de lumière »"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Rechercher une plante"
        />
      </form>
      <div className="flex flex-wrap gap-2">
        <Chip selected={petSafeOnly} icon="🐾" onClick={() => updateParam("petSafe", petSafeOnly ? null : "true")}>
          Sans danger pour les animaux
        </Chip>
        {PLANT_CATEGORY_LIST.map((cat) => (
          <Chip
            key={cat.value}
            icon={cat.icon}
            selected={activeCategory === cat.value}
            onClick={() => updateParam("category", activeCategory === cat.value ? null : cat.value)}
          >
            {cat.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
