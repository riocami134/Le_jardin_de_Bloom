import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";

describe("Badge", () => {
  it("affiche toujours une icône ET un texte — jamais la couleur seule (accessibilité)", () => {
    render(
      <Badge tone="success" icon="🟢">
        Bonne forme
      </Badge>,
    );
    expect(screen.getByText("Bonne forme")).toBeInTheDocument();
    expect(screen.getByText("🟢")).toBeInTheDocument();
  });
});
