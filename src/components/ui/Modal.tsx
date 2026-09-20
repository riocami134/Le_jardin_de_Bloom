"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconButton } from "./IconButton";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Effet séparé et dépendant uniquement de `open` : sinon, un `onClose`
  // recréé à chaque rendu du parent (ex. fonction fléchée inline) redonnait
  // le focus à la boîte de dialogue à chaque frappe dans un champ interne,
  // fermant le clavier mobile après chaque lettre.
  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-cocoa/40 p-0 sm:items-center sm:p-6">
      <button
        aria-label="Fermer"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "relative z-10 max-h-[90vh] w-full animate-pop-in overflow-y-auto rounded-t-card bg-ivory p-6 shadow-lift",
          "sm:max-w-lg sm:rounded-card",
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          {title && <h2 className="font-heading text-h3 text-cocoa">{title}</h2>}
          <IconButton label="Fermer" onClick={onClose} className="ml-auto">
            ✕
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}
