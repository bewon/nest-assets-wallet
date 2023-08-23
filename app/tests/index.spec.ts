import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
});

test("has title", async ({ page }) => {
  await expect(page).toHaveTitle(/AssetsWallet/);
});

test("has progress component with progressbar role", async ({ page }) => {
  await expect(page.getByRole("progressbar")).toBeVisible();
});
