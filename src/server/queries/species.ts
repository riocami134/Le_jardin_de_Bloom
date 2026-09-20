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

export async function searchSpecies(filters: SpeciesSearchInput) {
  return prisma.plantSpecies.findMany({
    where: {
      AND: [
        filters.category ? { category: filters.category } : {},
        filters.difficulty ? { difficulty: filters.difficulty } : {},
        filters.petSafe !== undefined ? { petSafe: filters.petSafe } : {},
        filters.indoorOutdoor ? { indoorOutdoor: filters.indoorOutdoor } : {},
        filters.query
          ? {
              OR: [
                { commonName: { contains: filters.query, mode: "insensitive" } },
                { scientificName: { contains: filters.query, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    },
    orderBy: { commonName: "asc" },
  });
}
