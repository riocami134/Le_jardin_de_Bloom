"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface CityAutocompleteProps {
  value: string;
  onChange: (city: string) => void;
}

interface CommuneResult {
  nom: string;
  codesPostaux: string[];
}

/**
 * Autocomplétion des communes françaises via l'API officielle du
 * gouvernement (geo.api.gouv.fr, ouverte, sans clé). Reste utilisable en
 * saisie libre si l'API est indisponible — la valeur tapée est toujours
 * transmise à onChange.
 */
export function CityAutocomplete({ value, onChange }: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<CommuneResult[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&boost=population&limit=8&fields=nom,codesPostaux`,
          { signal: controller.signal },
        );
        if (!res.ok) return;
        const data: CommuneResult[] = await res.json();
        setResults(data);
        setOpen(data.length > 0);
        setHighlighted(0);
      } catch {
        // recherche annulée ou réseau indisponible — la saisie libre reste possible
      }
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectCity(name: string) {
    setQuery(name);
    onChange(name);
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const picked = results[highlighted];
      if (picked) selectCity(picked.nom);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative text-left">
      <label htmlFor="city-autocomplete" className="text-small font-semibold text-cocoa">
        Ta ville
      </label>
      <input
        id="city-autocomplete"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          onChange(event.target.value);
        }}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Commence à taper… Lyon, Paris, Marseille"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls="city-autocomplete-listbox"
        aria-autocomplete="list"
        className="mt-1.5 w-full rounded-button border border-cocoa/20 bg-ivory px-4 py-3 text-body text-cocoa placeholder:text-cocoa/40 focus:border-sage"
      />
      {open && results.length > 0 && (
        <ul
          id="city-autocomplete-listbox"
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-button border border-cocoa/10 bg-ivory shadow-lift"
        >
          {results.map((result, index) => (
            <li key={`${result.nom}-${index}`} role="option" aria-selected={index === highlighted}>
              <button
                type="button"
                onClick={() => selectCity(result.nom)}
                onMouseEnter={() => setHighlighted(index)}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-2.5 text-left text-small",
                  index === highlighted ? "bg-sage/20 text-cocoa" : "text-cocoa/80",
                )}
              >
                <span>{result.nom}</span>
                {result.codesPostaux?.[0] && (
                  <span className="text-caption text-cocoa/50">{result.codesPostaux[0]}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
