import { expect, test } from "@playwright/test";
import { loginScript } from "../auth/auth.helper";
import { stubDataApiRequests } from "../api.helper";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(loginScript);
  await stubDataApiRequests(page);
  await page.route("/api/portfolios/default/history-statistics?*", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ portfolio: [] }) })
  );
});

test("should display Value Chart", async ({ page }) => {
  await page.goto("/history");
  await expect(page.locator("#value-chart canvas")).toBeVisible();
});

test("should display 1Y Performance Chart", async ({ page }) => {
  await page.goto("/history");
  await expect(page.locator("#performance-chart-1y canvas")).toBeVisible();
});

test("should display 3Y Performance Chart", async ({ page }) => {
  await page.goto("/history");
  await expect(page.locator("#performance-chart-3y canvas")).toBeVisible();
});
