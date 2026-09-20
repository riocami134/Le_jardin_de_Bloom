"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const DIRECTIONS: Array<{ value: string; label: string; angle: number }> = [
  { value: "nord", label: "N", angle: 0 },
  { value: "nord-est", label: "NE", angle: 45 },
  { value: "est", label: "E", angle: 90 },
  { value: "sud-est", label: "SE", angle: 135 },
  { value: "sud", label: "S", angle: 180 },
  { value: "sud-ouest", label: "SO", angle: 225 },
  { value: "ouest", label: "O", angle: 270 },
  { value: "nord-ouest", label: "NO", angle: 315 },
];

function angleToOrientation(angle: number): string {
  const normalized = ((angle % 360) + 360) % 360;
  let closest = DIRECTIONS[0]!;
  let smallestDiff = 360;
  for (const dir of DIRECTIONS) {
    const diff = Math.min(Math.abs(normalized - dir.angle), 360 - Math.abs(normalized - dir.angle));
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closest = dir;
    }
  }
  return closest.value;
}

export interface CompassPickerProps {
  value?: string;
  onChange: (orientation: string, usedSensor: boolean) => void;
}

/**
 * Sélecteur d'orientation de fenêtre : rose des vents cliquable (toujours
 * disponible) + lecture live du capteur d'orientation du téléphone quand
 * le navigateur le permet (nécessite une autorisation explicite sur iOS).
 */
export function CompassPicker({ value, onChange }: CompassPickerProps) {
  const [liveHeading, setLiveHeading] = useState<number | null>(null);
  const [sensorActive, setSensorActive] = useState(false);
  const [sensorError, setSensorError] = useState<string | null>(null);
  const listenerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        window.removeEventListener("deviceorientationabsolute", listenerRef.current as EventListener);
        window.removeEventListener("deviceorientation", listenerRef.current as EventListener);
      }
    };
  }, []);

  async function startSensor() {
    setSensorError(null);
    try {
      const DOEvent = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<"granted" | "denied">;
      };
      if (typeof DOEvent?.requestPermission === "function") {
        const permission = await DOEvent.requestPermission();
        if (permission !== "granted") {
          setSensorError("Autorisation refusée — choisis une direction manuellement ci-dessous.");
          return;
        }
      }

      const handler = (event: DeviceOrientationEvent) => {
        const webkitHeading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
        const heading = typeof webkitHeading === "number" ? webkitHeading : event.alpha != null ? 360 - event.alpha : null;
        if (heading != null) setLiveHeading(heading);
      };
      listenerRef.current = handler;
      window.addEventListener("deviceorientationabsolute", handler as EventListener);
      window.addEventListener("deviceorientation", handler as EventListener);
      setSensorActive(true);
    } catch {
      setSensorError("Impossible d'accéder à la boussole de cet appareil — choisis une direction manuellement.");
    }
  }

  function confirmLiveHeading() {
    if (liveHeading == null) return;
    onChange(angleToOrientation(liveHeading), true);
  }

  return (
    <div className="space-y-3">
      <div className="relative mx-auto h-40 w-40">
        <div className="absolute inset-0 rounded-full border-2 border-cocoa/20" />
        <div
          className="absolute left-1/2 top-1/2 h-16 w-1 origin-bottom rounded-full bg-leaf transition-transform"
          style={{ transform: `translate(-50%, -100%) rotate(${liveHeading ?? 0}deg)` }}
          aria-hidden="true"
        />
        {DIRECTIONS.map((dir) => (
          <button
            key={dir.value}
            type="button"
            onClick={() => onChange(dir.value, false)}
            className={cn(
              "absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-caption font-semibold transition-colors",
              value === dir.value ? "bg-leaf text-ivory" : "bg-ivory text-cocoa shadow-soft hover:bg-honey/30",
            )}
            style={{
              left: `${50 + 42 * Math.sin((dir.angle * Math.PI) / 180)}%`,
              top: `${50 - 42 * Math.cos((dir.angle * Math.PI) / 180)}%`,
            }}
            aria-pressed={value === dir.value}
          >
            {dir.label}
          </button>
        ))}
      </div>

      {!sensorActive ? (
        <button type="button" onClick={startSensor} className="w-full text-center text-small font-semibold text-leaf underline">
          🧭 Utiliser la boussole de mon téléphone
        </button>
      ) : (
        <div className="space-y-2 text-center">
          <p className="text-small text-cocoa/70">
            Oriente ton téléphone vers la fenêtre, puis valide dès que ça semble stable.
          </p>
          <button type="button" onClick={confirmLiveHeading} className="rounded-pill bg-leaf px-4 py-2 text-small font-semibold text-ivory">
            Valider cette direction ({angleToOrientation(liveHeading ?? 0).toUpperCase()})
          </button>
        </div>
      )}
      {sensorError && <p className="text-center text-caption text-coral">{sensorError}</p>}
      <p className="text-center text-caption text-cocoa/50">Ou touche directement une direction sur la rose des vents ci-dessus.</p>
    </div>
  );
}
