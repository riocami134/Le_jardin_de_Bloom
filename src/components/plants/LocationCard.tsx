import { Card } from "@/components/ui/Card";

const ORIENTATION_LABEL: Record<string, string> = {
  nord: "Nord",
  "nord-est": "Nord-Est",
  est: "Est",
  "sud-est": "Sud-Est",
  sud: "Sud",
  "sud-ouest": "Sud-Ouest",
  ouest: "Ouest",
  "nord-ouest": "Nord-Ouest",
};

export interface LocationCardProps {
  name: string;
  room?: string | null;
  indoorOutdoor: string;
  windowOrientation?: string | null;
}

export function LocationCard({ name, room, indoorOutdoor, windowOrientation }: LocationCardProps) {
  return (
    <Card className="space-y-2">
      <h3 className="font-heading text-h4 text-cocoa">Emplacement</h3>
      <p className="text-body text-cocoa">
        📍 {name} {room && room !== name ? `(${room})` : ""}
      </p>
      <p className="text-small text-cocoa/70">
        {indoorOutdoor === "interieur" ? "Intérieur" : "Extérieur"}
        {windowOrientation && ` · Fenêtre exposée ${ORIENTATION_LABEL[windowOrientation] ?? windowOrientation}`}
      </p>
    </Card>
  );
}
