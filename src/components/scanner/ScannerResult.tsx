import { Card } from "@/components/ui/Card";
import type { PlantIdentification } from "@/types";

export function ScannerResult({ identification }: { identification: PlantIdentification }) {
  const confident = identification.confidence >= 0.7;

  return (
    <Card className="space-y-2">
      <p className="text-caption font-semibold uppercase tracking-wide text-cocoa/50">Identification</p>
      <h3 className="font-heading text-h3 text-cocoa">{identification.commonName}</h3>
      <p className="text-small italic text-cocoa/60">{identification.scientificName}</p>
      <p className="text-small text-cocoa/80">
        {confident
          ? `Bloom pense qu'il s'agit probablement d'un ${identification.commonName} (${Math.round(identification.confidence * 100)}% de confiance).`
          : "Bloom n'est pas suffisamment certain, une photo plus proche de la feuille pourrait l'aider."}
      </p>
    </Card>
  );
}
