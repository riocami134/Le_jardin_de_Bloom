import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("demo@jardindebloom.app");
  await page.getByLabel("Mot de passe").fill("JardinDeBloom2026!");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL("/");
}

test.describe("Plantes", () => {
  test("ajouter puis supprimer une plante", async ({ page }) => {
    await login(page);
    await page.goto("/plants");

    await page.getByRole("button", { name: "+ Ajouter une plante" }).click();
    await page.getByLabel("Nom de ta plante").fill("Ma plante de test E2E");
    await page.getByRole("button", { name: "Ajouter au jardin" }).click();

    await expect(page).toHaveURL(/\/plants\/.+/);
    await expect(page.getByRole("heading", { name: "Ma plante de test E2E" })).toBeVisible();

    await page.getByRole("button", { name: "Supprimer cette plante" }).click();
    await page.getByRole("button", { name: "Confirmer" }).click();
    await expect(page).toHaveURL("/plants");
  });

  test("ouvrir le jardin virtuel", async ({ page }) => {
    await login(page);
    await page.goto("/garden");
    await expect(page.getByRole("heading", { name: "Mon jardin" })).toBeVisible();
  });

  test("ouvrir Explorer", async ({ page }) => {
    await login(page);
    await page.goto("/explore");
    await expect(page.getByRole("heading", { name: "Explorer" })).toBeVisible();
  });
});
