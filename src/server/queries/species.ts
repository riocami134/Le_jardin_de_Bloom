import { prisma } from "@/lib/db/prisma";
import type { SpeciesSearchInput } from "@/lib/validation/species";

export async function getAllSpecies() {
  return prisma.plantSpecies.findMany({ orderBy: { commonName: "asc" } });
}

export async function getSpeciesById(id: string) {
  return prisma.plantSpecies.findUnique({ where: { id } });
}

export async function findSpeciesByScientificName(scientificName: string) {
  return prisma.plantSpecies.findUnique({ where: { scientificName } });
}

export const SPECIES_PAGE_SIZE = 21;

export async function searchSpecies(filters: SpeciesSearchInput, page = 1) {
  const where = {
    AND: [
      filters.category ? { category: filters.category } : {},
      filters.difficulty ? { difficulty: filters.difficulty } : {},
      filters.petSafe !== undefined ? { petSafe: filters.petSafe } : {},
      filters.indoorOutdoor ? { indoorOutdoor: filters.indoorOutdoor } : {},
      filters.query
        ? {
            OR: [
              { commonName: { contains: filters.query, mode: "insensitive" as const } },
              { scientificName: { contains: filters.query, mode: "insensitive" as const } },
            ],
          }
        : {},
    ],
  };

  const safePage = Math.max(1, page);
  const [items, total] = await Promise.all([
    prisma.plantSpecies.findMany({
      where,
      // Popularité = nombre de plantes réellement enregistrées par les
      // utilisateurs pour cette espèce (plutôt que l'ordre alphabétique) ;
      // l'alphabétique ne sert qu'à départager les ex æquo (la grande
      // majorité du catalogue, jamais encore associée à une plante).
      orderBy: [{ plants: { _count: "desc" } }, { commonName: "asc" }],
      skip: (safePage - 1) * SPECIES_PAGE_SIZE,
      take: SPECIES_PAGE_SIZE,
    }),
    prisma.plantSpecies.count({ where }),
  ]);

  return { items, total, page: safePage, pageSize: SPECIES_PAGE_SIZE, totalPages: Math.max(1, Math.ceil(total / SPECIES_PAGE_SIZE)) };
}
