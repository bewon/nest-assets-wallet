import { test, expect } from "@playwright/test";
import { loginScript } from "./auth/auth.helper";

test("has title", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/AssetsWallet/);
});

test("has progress component with progressbar role", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("progressbar")).toBeVisible();
});

test("should be redirected to /auth/login if session is missing", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveURL("/auth/login");
});
test("should be redirected to /snapshot if session is present", async ({
  page,
}) => {
  await page.addInitScript(loginScript);
  await page.goto("/");

  await expect(page).toHaveURL("/snapshot");
});
