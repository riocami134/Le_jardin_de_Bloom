import { Card } from "@/components/ui/Card";
import type { WeatherContext } from "@/types";

const CONDITION_ICON: Record<string, string> = {
  sunny: "☀️",
  partly_cloudy: "⛅",
  cloudy: "☁️",
  rainy: "🌧️",
  stormy: "⛈️",
  snowy: "❄️",
};

const CONDITION_LABEL: Record<string, string> = {
  sunny: "Ensoleillé",
  partly_cloudy: "Partiellement nuageux",
  cloudy: "Nuageux",
  rainy: "Pluvieux",
  stormy: "Orageux",
  snowy: "Neigeux",
};

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export interface WeatherCardProps {
  weather: WeatherContext;
}

export function WeatherCard({ weather }: WeatherCardProps) {
  const { current, forecast } = weather;
  const today = new Date(current.timestamp);
  const todayLabel = today.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-small font-semibold text-cocoa/60">
            Météo · {current.city} · <span className="capitalize">{todayLabel}</span>
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-h1" aria-hidden="true">
              {CONDITION_ICON[current.condition] ?? "🌤️"}
            </span>
            <span className="font-heading text-h1 text-cocoa">{Math.round(current.temperatureC)}°C</span>
          </div>
          <p className="text-small text-cocoa/70">{CONDITION_LABEL[current.condition] ?? current.condition}</p>
        </div>
        <div className="space-y-1 text-right text-small text-cocoa/70">
          <p>💧 Humidité {Math.round(current.humidityPct)}%</p>
          <p>💨 Vent {Math.round(current.windSpeedKmh)} km/h</p>
          <p>🌦️ Pluie {Math.round(current.rainProbability * 100)}%</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-5 gap-1 border-t border-cocoa/10 pt-4">
        {forecast.slice(0, 5).map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-1 text-center">
            <span className="text-caption font-semibold text-cocoa/60">
              {DAY_LABELS[new Date(day.date).getDay()]}
            </span>
            <span className="text-h4" aria-hidden="true">
              {CONDITION_ICON[day.condition] ?? "🌤️"}
            </span>
            <span className="text-caption text-cocoa/70">
              {Math.round(day.temperatureMaxC)}°/{Math.round(day.temperatureMinC)}°
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
