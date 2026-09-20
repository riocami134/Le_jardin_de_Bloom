"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import {
  exportUserDataAction,
  deleteAllPhotosAction,
  deleteHistoryAction,
  deleteAccountAction,
} from "@/server/actions/privacy-actions";
import { updateConsentAction } from "@/server/actions/settings-actions";

export interface PrivacyPanelProps {
  consentLocation: boolean;
  consentNotifications: boolean;
}

export function PrivacyPanel({ consentLocation, consentNotifications }: PrivacyPanelProps) {
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [location, setLocation] = useState(consentLocation);
  const [notifications, setNotifications] = useState(consentNotifications);

  function toggleConsent(key: "consentLocation" | "consentNotifications") {
    const nextLocation = key === "consentLocation" ? !location : location;
    const nextNotifications = key === "consentNotifications" ? !notifications : notifications;
    setLocation(nextLocation);
    setNotifications(nextNotifications);
    startTransition(async () => {
      await updateConsentAction({ consentLocation: nextLocation, consentNotifications: nextNotifications });
    });
  }

  async function handleExport() {
    const result = await exportUserDataAction();
    if (!result.success) {
      showToast(result.error, "error");
      return;
    }
    const blob = new Blob([result.data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jardin-de-bloom-mes-donnees.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDeletePhotos() {
    startTransition(async () => {
      const result = await deleteAllPhotosAction();
      showToast(result.success ? "Toutes tes photos ont été supprimées" : (result.error ?? "Erreur"), result.success ? "info" : "error");
    });
  }

  function handleDeleteHistory() {
    startTransition(async () => {
      const result = await deleteHistoryAction();
      showToast(result.success ? "Ton historique a été supprimé" : (result.error ?? "Erreur"), result.success ? "info" : "error");
    });
  }

  function handleDeleteAccount() {
    startTransition(async () => {
      await deleteAccountAction();
    });
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h2 className="font-heading text-h4 text-cocoa">Consentements</h2>
        <div className="flex flex-wrap gap-2">
          <Chip selected={location} icon="📍" onClick={() => toggleConsent("consentLocation")}>
            Localisation (pour la météo)
          </Chip>
          <Chip selected={notifications} icon="🔔" onClick={() => toggleConsent("consentNotifications")}>
            Notifications
          </Chip>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-heading text-h4 text-cocoa">Tes données</h2>
        <p className="text-small text-cocoa/70">
          Tes photos sont privées par défaut et ne sont jamais exposées publiquement.
        </p>
        <Button variant="secondary" onClick={handleExport} disabled={pending}>
          📤 Exporter mes données
        </Button>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-heading text-h4 text-cocoa">Supprimer des données</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="tertiary" onClick={handleDeletePhotos} disabled={pending}>
            Supprimer mes photos
          </Button>
          <Button variant="tertiary" onClick={handleDeleteHistory} disabled={pending}>
            Supprimer mon historique
          </Button>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-heading text-h4 text-cocoa">Supprimer mon compte</h2>
        <p className="text-small text-cocoa/70">
          Cette action est définitive : toutes tes plantes, photos et données seront supprimées.
        </p>
        <Button variant="danger" onClick={() => setConfirmDelete(true)}>
          Supprimer définitivement mon compte
        </Button>
      </Card>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Confirmer la suppression">
        <p className="text-small text-cocoa/70">
          Es-tu sûr·e de vouloir supprimer définitivement ton compte et toutes tes données ? Cette action est
          irréversible.
        </p>
        <div className="mt-4 flex gap-3">
          <Button variant="tertiary" onClick={() => setConfirmDelete(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount} disabled={pending}>
            {pending ? "Suppression…" : "Oui, supprimer"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
