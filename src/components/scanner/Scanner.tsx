"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BloomCharacter } from "@/components/bloom/BloomCharacter";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { ScannerResult } from "./ScannerResult";
import { HealthScore } from "./HealthScore";
import { HealthAnalysisView } from "./HealthAnalysisView";
import { BloomAdvice } from "@/components/bloom/BloomAdvice";
import { createPlantAction } from "@/server/actions/plant-actions";
import type { BloomMessage, BloomQuestion, HealthObservation, PlantIdentification, Recommendation } from "@/types";

type ScannerState = "idle" | "preview" | "analyzing" | "result" | "error";

interface AnalyzeResponse {
  identification: PlantIdentification;
  health: HealthObservation;
  questions: BloomQuestion[];
  recommendation: Recommendation;
  bloomMessage: BloomMessage;
}

export interface ScannerProps {
  existingPlants: Array<{ id: string; name: string }>;
  speciesLookup: Record<string, string | undefined>; // scientificName -> speciesId
}

export function Scanner({ existingPlants, speciesLookup }: ScannerProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<ScannerState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [saveTarget, setSaveTarget] = useState<string>("new");
  const [newPlantName, setNewPlantName] = useState("");
  const [saving, setSaving] = useState(false);
  // Non coché par défaut : la photo reste privée tant que l'utilisateur
  // n'a pas explicitement accepté qu'elle serve d'illustration publique
  // pour cette espèce dans Explorer.
  const [sharePhotoForSpecies, setSharePhotoForSpecies] = useState(false);

  function handleFileSelected(selected: File) {
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setState("preview");
    setResult(null);
  }

  async function handleAnalyze() {
    if (!file) return;
    setState("analyzing");
    setErrorMessage(null);

    try {
      const identifyForm = new FormData();
      identifyForm.append("file", file);
      const identifyRes = await fetch("/api/scanner/identify", { method: "POST", body: identifyForm });
      const identifyData = await identifyRes.json();
      if (!identifyRes.ok) throw new Error(identifyData.error);

      const analyzeForm = new FormData();
      analyzeForm.append("file", file);
      analyzeForm.append("plantName", identifyData.identification.commonName);
      const analyzeRes = await fetch("/api/scanner/analyze", { method: "POST", body: analyzeForm });
      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error);

      setResult({ identification: identifyData.identification, ...analyzeData });
      setNewPlantName(identifyData.identification.commonName);
      setState("result");
    } catch {
      setErrorMessage("Oups… Bloom n'arrive pas à analyser cette photo. Réessaie dans quelques instants. 🐰");
      setState("error");
    }
  }

  async function handleSave() {
    if (!file || !result) return;
    setSaving(true);

    try {
      let plantId = saveTarget;
      if (saveTarget === "new") {
        const speciesId = speciesLookup[result.identification.scientificName];
        const createResult = await createPlantAction({
          name: newPlantName || result.identification.commonName,
          speciesId,
          // Si l'espèce n'est pas encore dans Explorer, le serveur l'y
          // ajoute automatiquement à partir de cette identification.
          identification: speciesId
            ? undefined
            : {
                scientificName: result.identification.scientificName,
                commonName: result.identification.commonName,
                ...result.identification.speciesDetails,
              },
        });
        if (!createResult.success || !createResult.id) throw new Error(createResult.error);
        plantId = createResult.id;
      }

      const form = new FormData();
      form.append("file", file);
      form.append("score", String(result.health.score));
      form.append("confidence", String(result.health.confidence));
      form.append("observations", JSON.stringify(result.health.flags));
      form.append("hypotheses", JSON.stringify([]));
      form.append("recommendations", JSON.stringify([result.recommendation.action]));
      form.append("sharePhotoForSpecies", String(sharePhotoForSpecies));

      const res = await fetch(`/api/plants/${plantId}/analysis`, { method: "POST", body: form });
      if (!res.ok) throw new Error((await res.json()).error);

      showToast("Analyse enregistrée 🌿", "success");
      router.push(`/plants/${plantId}`);
    } catch {
      showToast("Impossible d'enregistrer cette analyse pour le moment.", "error");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setState("idle");
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setAnswers({});
  }

  return (
    <div className="space-y-5">
      {state === "idle" && (
        <Card className="flex flex-col items-center gap-4 text-center">
          <BloomCharacter emotion="advising" size="lg" />
          <div>
            <h2 className="font-heading text-h3 text-cocoa">Montre ta plante à Bloom</h2>
            <p className="mt-1 text-small text-cocoa/70">Une photo suffit pour l&apos;identifier et observer sa santé.</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            // Pas d'attribut `capture` : sur beaucoup de navigateurs mobiles
            // (Android notamment), il force l'ouverture directe de
            // l'appareil photo et masque l'option "Galerie" du sélecteur
            // natif — alors que le bouton propose explicitement les deux.
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
          />
          <Button onClick={() => inputRef.current?.click()}>📷 Prendre ou choisir une photo</Button>
        </Card>
      )}

      {state === "preview" && previewUrl && (
        <Card className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Aperçu de la photo" className="w-full rounded-button object-cover" />
          <div className="flex gap-3">
            <Button variant="tertiary" onClick={reset}>
              Changer de photo
            </Button>
            <Button className="flex-1" onClick={handleAnalyze}>
              Analyser
            </Button>
          </div>
        </Card>
      )}

      {state === "analyzing" && (
        <Card className="flex flex-col items-center gap-4 text-center">
          <BloomCharacter emotion="focused" size="lg" animated />
          <p className="text-body text-cocoa">Bloom observe attentivement…</p>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
      )}

      {state === "error" && (
        <Card className="flex flex-col items-center gap-4 text-center">
          <BloomCharacter emotion="worried" size="lg" />
          <p className="text-body text-cocoa">{errorMessage}</p>
          <Button onClick={handleAnalyze}>Réessayer</Button>
        </Card>
      )}

      {state === "result" && result && previewUrl && (
        <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Photo analysée" className="w-full rounded-card object-cover" />
          <ScannerResult identification={result.identification} />
          <Card>
            <HealthScore score={result.health.score} confidence={result.health.confidence} />
            <div className="mt-4">
              <HealthAnalysisView flags={result.health.flags} notes={result.health.notes} />
            </div>
          </Card>

          {result.questions.length > 0 && (
            <Card className="space-y-3">
              <p className="text-small font-semibold text-cocoa">Quelques questions de Bloom</p>
              {result.questions.map((q) => (
                <Input
                  key={q.id}
                  label={q.question}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                />
              ))}
            </Card>
          )}

          <BloomAdvice recommendation={result.recommendation} emotion={result.bloomMessage.emotion} />

          <Card className="space-y-3">
            <p className="text-small font-semibold text-cocoa">Enregistrer cette analyse</p>
            <Select value={saveTarget} onChange={(e) => setSaveTarget(e.target.value)}>
              <option value="new">Nouvelle plante</option>
              {existingPlants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            {saveTarget === "new" && (
              <Input label="Nom de la plante" value={newPlantName} onChange={(e) => setNewPlantName(e.target.value)} />
            )}
            <label className="flex items-start gap-2 text-caption text-cocoa/70">
              <input
                type="checkbox"
                checked={sharePhotoForSpecies}
                onChange={(e) => setSharePhotoForSpecies(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-leaf"
              />
              <span>
                J&apos;accepte que cette photo serve d&apos;illustration publique pour cette espèce dans Explorer, visible par
                tous les utilisateurs (uniquement si cette espèce n&apos;a pas encore de photo).
              </span>
            </label>
            <div className="flex gap-3">
              <Button variant="tertiary" onClick={reset}>
                Recommencer
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
