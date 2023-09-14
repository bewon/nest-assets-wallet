import { expect, test } from "@playwright/test";
import { loginScript } from "../auth/auth.helper";

test("has title", async ({ page }) => {
  await page.addInitScript(loginScript);
  await page.goto("/history");

  await expect(page).toHaveTitle("Portfolio history | AssetsWallet");
});

test("should make API call for groups", async ({ page }) => {
  await page.addInitScript(loginScript);
  const gotoPromise = page.goto("/history");
  const request = await page.waitForRequest("/api/portfolios/default/groups");
  await gotoPromise;

  expect(request.method()).toBe("GET");
});

test("should make API call for history statistics", async ({ page }) => {
  await page.addInitScript(loginScript);
  const gotoPromise = page.goto("/history");
  const request = await page.waitForRequest(
    "/api/portfolios/default/history-statistics?withAssets=false"
  );
  await gotoPromise;

  expect(request.method()).toBe("GET");
});

test("should display error message when API call fails", async ({ page }) => {
  await page.addInitScript(loginScript);
  await page.route("/api/portfolios/default/groups", (route) =>
    route.fulfill({ status: 200 })
  );
  await page.route("/api/portfolios/default/history-statistics?*", (route) =>
    route.fulfill({ status: 500 })
  );
  const gotoPromise = page.goto("/history");
  await page.waitForRequest("/api/portfolios/default/history-statistics?*");
  await gotoPromise;
  await page.waitForSelector("[role=alert]");
  const boundingBox = await page.locator("[role=alert]").first().boundingBox();

  expect(boundingBox?.width).toBeGreaterThan(1);
});

test("has period selector", async ({ page }) => {
  await page.addInitScript(loginScript);
  await page.goto("/history");

  await expect(page.locator("[name=period]")).toBeVisible();
});

test("has Show Assets switch", async ({ page }) => {
  await page.addInitScript(loginScript);
  await page.goto("/history");

  await expect(page.locator("[name=show-assets]")).toBeVisible();
});

test("should display group selector after loading groups", async ({ page }) => {
  await page.addInitScript(loginScript);
  await page.route("/api/portfolios/default/groups", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify(["G1", "G2"]) })
  );
  await page.route("/api/portfolios/default/history-statistics?*", (route) =>
    route.fulfill({ status: 200 })
  );
  const gotoPromise = page.goto("/history");
  await page.waitForRequest("/api/portfolios/default/groups");
  await gotoPromise;

  const groupSelector = page.locator("[name=group]").locator("..");
  await expect(groupSelector).toBeVisible();
  await groupSelector.click();
  await expect(page.locator("[role=option]")).toHaveCount(3);
  await expect(page.locator("[role=option]").nth(1)).toContainText("G1");
  await expect(page.locator("[role=option]").nth(2)).toContainText("G2");
});
