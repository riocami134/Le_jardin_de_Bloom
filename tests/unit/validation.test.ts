import { describe, expect, it } from "vitest";
import { createPlantSchema } from "@/lib/validation/plant";
import { registerSchema } from "@/lib/validation/auth";
import { bloomMessageSchema } from "@/lib/validation/bloom";

describe("Validation Zod", () => {
  it("rejette un nom de plante vide", () => {
    const result = createPlantSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("accepte une plante valide sans espèce", () => {
    const result = createPlantSchema.safeParse({ name: "Mon Monstera" });
    expect(result.success).toBe(true);
  });

  it("rejette un mot de passe trop court à l'inscription", () => {
    const result = registerSchema.safeParse({ name: "Alex", email: "alex@test.fr", password: "1234" });
    expect(result.success).toBe(false);
  });

  it("valide un message Bloom bien formé", () => {
    const result = bloomMessageSchema.safeParse({ emotion: "happy", message: "Tout va bien !", priority: "low" });
    expect(result.success).toBe(true);
  });

  it("rejette une émotion Bloom inconnue", () => {
    const result = bloomMessageSchema.safeParse({ emotion: "angry", message: "…", priority: "low" });
    expect(result.success).toBe(false);
  });
});
