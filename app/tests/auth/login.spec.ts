import { test, expect } from "@playwright/test";
import { loginScript } from "./auth.helper";

test("has title", async ({ page }) => {
  await page.goto("/auth/login");

  await expect(page).toHaveTitle("Log in | AssetsWallet");
});

test("should remove session at the beginning", async ({ page }) => {
  await page.addInitScript(loginScript);
  await page.goto("/auth/login");

  await expect(
    page.evaluate(() => sessionStorage.getItem("session-data"))
  ).resolves.toBeNull();
});

test.describe("login form", () => {
  test("should log in with valid API response", async ({ page }) => {
    await page.goto("/auth/login");
    await page.route("**/api/auth/login", (route) => {
      route.fulfill({
        status: 200,
        body: '{ "accessToken": "hbgujbngfu", "userEmail": "test@bewon.eu" }',
      });
    });
    await page.fill("#email", "test@bewon.eu");
    await page.fill("#password", "test");
    await page.click("button[type=submit]");

    await expect(page).toHaveURL("/");
  });

  test("should show an error message with invalid API response", async ({
    page,
  }) => {
    await page.goto("/auth/login");
    await page.route("**/api/auth/login", (route) => {
      route.fulfill({ status: 200 });
    });
    await page.fill("#email", "test@bewon");
    await page.fill("#password", "test");
    await page.click("button[type=submit]");
    await expect(page.locator("[role=alert]")).toBeVisible();
  });
});
