import { test, expect } from "@playwright/test";
import { loginScript } from "./auth/auth.helper";

test("has title", async ({ page }) => {
  await page.addInitScript(loginScript);
  await page.goto("/snapshot");

  await expect(page).toHaveTitle("Portfolio snapshot | AssetsWallet");
});
