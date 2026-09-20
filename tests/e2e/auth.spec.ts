import { test, expect } from "@playwright/test";

/**
 * Utilise le compte de démonstration créé par prisma/seed.ts.
 * Nécessite une base de données seedée (`npm run db:seed`) avant exécution.
 */
test.describe("Authentification", () => {
  test("un visiteur non connecté est redirigé vers /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("connexion avec le compte de démonstration", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("demo@jardindebloom.app");
    await page.getByLabel("Mot de passe").fill("JardinDeBloom2026!");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
