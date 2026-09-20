"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
}

export function Tabs({ items, defaultTabId }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTabId ?? items[0]?.id);
  const baseId = useId();

  return (
    <div>
      <div role="tablist" className="flex gap-2 overflow-x-auto pb-2" aria-label="Sections">
        {items.map((item) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-controls={`${baseId}-panel-${item.id}`}
              aria-selected={selected}
              onClick={() => setActiveId(item.id)}
              className={cn(
                "whitespace-nowrap rounded-pill px-4 py-2 text-small font-semibold transition-colors",
                selected ? "bg-sage text-ivory" : "bg-cocoa/5 text-cocoa hover:bg-cocoa/10",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== activeId}
          className="pt-4"
        >
          {item.id === activeId && item.content}
        </div>
      ))}
    </div>
  );
}
