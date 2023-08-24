import { test, expect } from "@playwright/test";
import { loginScript } from "./auth/auth.helper";

const indexUrl = "http://localhost:3000";

test("has title", async ({ page }) => {
  await page.goto(indexUrl);
  await expect(page).toHaveTitle(/AssetsWallet/);
});

test("has progress component with progressbar role", async ({ page }) => {
  await page.goto(indexUrl);
  await expect(page.getByRole("progressbar")).toBeVisible();
});

test("should be redirected to /auth/login if session is missing", async ({
  page,
}) => {
  await page.goto(indexUrl);
  const loginUrl = "http://localhost:3000/auth/login";
  await page.waitForURL(loginUrl, { timeout: 3000 });

  expect(page.url()).toBe(loginUrl);
});
test("should be redirected to /snapshot if session is present", async ({
  page,
}) => {
  await page.addInitScript(loginScript);
  await page.goto(indexUrl);
  const snapshotUrl = "http://localhost:3000/snapshot";
  await page.waitForURL(snapshotUrl, { timeout: 3000 });

  expect(page.url()).toBe(snapshotUrl);
});
