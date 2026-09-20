"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BloomCharacter } from "@/components/bloom/BloomCharacter";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { CityAutocomplete } from "@/components/onboarding/CityAutocomplete";
import { Progress } from "@/components/ui/Progress";
import { completeOnboardingAction } from "@/server/actions/onboarding-actions";
import type { OnboardingInput } from "@/lib/validation/onboarding";

const STORAGE_KEY = "jardin-de-bloom:onboarding-draft";

const LOCATION_OPTIONS: Array<{ value: OnboardingInput["plantLocationType"]; label: string; icon: string }> = [
  { value: "interieur", label: "Intérieur", icon: "🏠" },
  { value: "balcon", label: "Balcon", icon: "🪟" },
  { value: "jardin", label: "Jardin", icon: "🌳" },
  { value: "plusieurs", label: "Plusieurs endroits", icon: "🗺️" },
];

const PET_OPTIONS: Array<{ value: "chat" | "chien" | "lapin"; label: string; icon: string }> = [
  { value: "chat", label: "Chat", icon: "🐱" },
  { value: "chien", label: "Chien", icon: "🐶" },
  { value: "lapin", label: "Lapin", icon: "🐰" },
];

const COUNT_OPTIONS: OnboardingInput["plantCountRange"][] = ["1-5", "6-15", "16-30", "30+"];

type Draft = Partial<OnboardingInput>;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({ pets: [] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setDraft(JSON.parse(saved));
      } catch {
        // ignore un brouillon corrompu
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const totalSteps = 5;

  async function handleFinish() {
    setSubmitting(true);
    setError(null);
    const result = await completeOnboardingAction({
      city: draft.city ?? "",
      plantLocationType: draft.plantLocationType ?? "interieur",
      pets: draft.pets ?? [],
      plantCountRange: draft.plantCountRange ?? "1-5",
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Une erreur est survenue");
      return;
    }
    window.localStorage.removeItem(STORAGE_KEY);
    router.push("/");
    router.refresh();
  }

  function togglePet(pet: "chat" | "chien" | "lapin") {
    setDraft((prev) => {
      const pets = prev.pets ?? [];
      return { ...prev, pets: pets.includes(pet) ? pets.filter((p) => p !== pet) : [...pets, pet] };
    });
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-taupe px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <Progress value={((step + 1) / totalSteps) * 100} tone="success" />

        <Card className="space-y-5">
          {step === 0 && (
            <StepShell emotion="cute" title="Où vis-tu ?" subtitle="Ça nous aide à te donner la bonne météo.">
              <CityAutocomplete
                value={draft.city ?? ""}
                onChange={(city) => setDraft((p) => ({ ...p, city }))}
              />
            </StepShell>
          )}

          {step === 1 && (
            <StepShell emotion="focused" title="Où sont tes plantes ?" subtitle="Choisis ce qui te correspond le mieux.">
              <div className="flex flex-wrap gap-2">
                {LOCATION_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    icon={opt.icon}
                    selected={draft.plantLocationType === opt.value}
                    onClick={() => setDraft((p) => ({ ...p, plantLocationType: opt.value }))}
                  >
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell emotion="excited" title="As-tu des animaux ?" subtitle="Bloom pourra t'alerter sur les plantes toxiques.">
              <div className="flex flex-wrap gap-2">
                {PET_OPTIONS.map((opt) => (
                  <Chip key={opt.value} icon={opt.icon} selected={(draft.pets ?? []).includes(opt.value)} onClick={() => togglePet(opt.value)}>
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell emotion="surprised" title="Combien de plantes as-tu ?" subtitle="Pas besoin d'être précis !">
              <div className="flex flex-wrap gap-2">
                {COUNT_OPTIONS.map((opt) => (
                  <Chip key={opt} selected={draft.plantCountRange === opt} onClick={() => setDraft((p) => ({ ...p, plantCountRange: opt }))}>
                    {opt}
                  </Chip>
                ))}
              </div>
            </StepShell>
          )}

          {step === 4 && (
            <StepShell emotion="celebrating" title="Parfait. Ton jardin est prêt. 🌱" subtitle="Bloom t'attend pour commencer l'aventure." />
          )}

          {error && <p className="text-small text-coral">{error}</p>}

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <Button variant="tertiary" onClick={() => setStep((s) => s - 1)}>
                Retour
              </Button>
            )}
            {step < totalSteps - 1 ? (
              <Button className="flex-1" onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !draft.city}>
                Continuer
              </Button>
            ) : (
              <Button className="flex-1" onClick={handleFinish} disabled={submitting}>
                {submitting ? "Un instant…" : "C'est parti !"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StepShell({
  emotion,
  title,
  subtitle,
  children,
}: {
  emotion: Parameters<typeof BloomCharacter>[0]["emotion"];
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-4 text-center">
      <BloomCharacter emotion={emotion} size="lg" animated className="mx-auto" />
      <div>
        <h1 className="font-heading text-h3 text-cocoa">{title}</h1>
        {subtitle && <p className="mt-1 text-small text-cocoa/70">{subtitle}</p>}
      </div>
      {children && <div className="pt-2">{children}</div>}
    </div>
  );
}
