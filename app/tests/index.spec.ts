import { test, expect } from "@playwright/test";
import { loginScript } from "./auth/auth.helper";

test("has title", async ({ page }) => {
  await page.goto("/");
  throw {
    DEPLOYMENT_STATUS_1: process.env.DEPLOYMENT_STATUS_1,
    DEPLOYMENT_STATUS_2: process.env.DEPLOYMENT_STATUS_2,
    DEPLOYMENT_STATUS_3: process.env.DEPLOYMENT_STATUS_3,
    DEPLOYMENT_STATUS_4: process.env.DEPLOYMENT_STATUS_4,
    DEPLOYMENT_STATUS_5: process.env.DEPLOYMENT_STATUS_5,
  };

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
