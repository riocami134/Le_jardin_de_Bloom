import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSpeciesById } from "@/server/queries/species";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PLANT_CATEGORIES } from "@/constants/plant-categories";
import { cleanSpeciesName } from "@/lib/botanics/clean-species-name";

export async function generateMetadata({ params }: { params: Promise<{ speciesId: string }> }): Promise<Metadata> {
  const { speciesId } = await params;
  const species = await getSpeciesById(speciesId);
  const commonName = species ? cleanSpeciesName(species.commonName) : undefined;
  return { title: commonName ?? "Espèce", description: species ? `Tout savoir sur ${commonName} (${species.scientificName})` : undefined };
}

export default async function SpeciesDetailPage({ params }: { params: Promise<{ speciesId: string }> }) {
  const { speciesId } = await params;
  const species = await getSpeciesById(speciesId);
  if (!species) notFound();

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-card bg-ivory shadow-soft">
        <div className="relative aspect-[16/9] bg-ivory">
          {species.imageUrl ? (
            <Image src={species.imageUrl} alt={species.commonName} fill className="object-cover" priority />
          ) : (
            <Image
              src={PLANT_CATEGORIES[species.category].avatarUrl}
              alt={PLANT_CATEGORIES[species.category].label}
              fill
              className="object-contain p-6"
              priority
            />
          )}
        </div>
        <div className="space-y-2 p-5">
          <h1 className="font-heading text-h2 text-cocoa">{cleanSpeciesName(species.commonName)}</h1>
          <p className="text-small italic text-cocoa/60">{species.scientificName} · {species.family}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge tone="info" icon={PLANT_CATEGORIES[species.category].icon}>{PLANT_CATEGORIES[species.category].label}</Badge>
            <Badge tone="neutral">Difficulté : {species.difficulty}</Badge>
            {species.petSafe ? <Badge tone="success" icon="🐾">Sans danger pour les animaux</Badge> : <Badge tone="attention" icon="⚠️">Toxique pour les animaux</Badge>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard title="☀️ Lumière" text={species.light} />
        <InfoCard title="💧 Arrosage" text={species.watering} />
        {species.temperatureRange && <InfoCard title="🌡️ Température" text={species.temperatureRange} />}
        {species.humidity && <InfoCard title="💦 Humidité" text={species.humidity} />}
        {species.fertilizing && <InfoCard title="🌸 Fertilisation" text={species.fertilizing} />}
        {species.pruning && <InfoCard title="✂️ Taille" text={species.pruning} />}
        {species.repotting && <InfoCard title="🪴 Rempotage" text={species.repotting} />}
        {species.propagation && <InfoCard title="🌱 Multiplication" text={species.propagation} />}
      </div>

      {species.commonProblems.length > 0 && (
        <Card>
          <h2 className="font-heading text-h4 text-cocoa">Problèmes courants</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-small text-cocoa/80">
            {species.commonProblems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Card>
      )}

      {species.origin && (
        <Card>
          <h2 className="font-heading text-h4 text-cocoa">Origine</h2>
          <p className="mt-1 text-small text-cocoa/80">{species.origin}</p>
        </Card>
      )}

      <div className="text-center">
        <Link href="/explore/compare" className="text-small font-semibold text-cocoa underline">
          Comparer avec une autre espèce
        </Link>
      </div>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <Card>
      <h3 className="font-heading text-h4 text-cocoa">{title}</h3>
      <p className="mt-1 text-small text-cocoa/80">{text}</p>
    </Card>
  );
}
