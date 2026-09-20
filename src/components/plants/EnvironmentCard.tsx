import { Card } from "@/components/ui/Card";

export interface EnvironmentCardProps {
  temperatureC?: number | null;
  humidityPct?: number | null;
  lightDescription?: string | null;
  notes?: string | null;
}

export function EnvironmentCard({ temperatureC, humidityPct, lightDescription, notes }: EnvironmentCardProps) {
  return (
    <Card className="space-y-2">
      <h3 className="font-heading text-h4 text-cocoa">Environnement</h3>
      <dl className="grid grid-cols-2 gap-3 text-small text-cocoa/80">
        {typeof temperatureC === "number" && (
          <div>
            <dt className="text-caption text-cocoa/50">Température</dt>
            <dd>{temperatureC}°C</dd>
          </div>
        )}
        {typeof humidityPct === "number" && (
          <div>
            <dt className="text-caption text-cocoa/50">Humidité</dt>
            <dd>{humidityPct}%</dd>
          </div>
        )}
        {lightDescription && (
          <div className="col-span-2">
            <dt className="text-caption text-cocoa/50">Lumière</dt>
            <dd>{lightDescription}</dd>
          </div>
        )}
      </dl>
      {notes && <p className="text-small text-cocoa/70">{notes}</p>}
    </Card>
  );
}
