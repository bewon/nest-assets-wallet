import { expect, test } from "@playwright/test";
import { loginScript } from "../auth/auth.helper";
import { stubDataApiRequests } from "../api.helper";

test("has title", async ({ page }) => {
  await page.addInitScript(loginScript);
  await stubDataApiRequests(page);
  await page.goto("/history");

  await expect(page).toHaveTitle("Portfolio history | AssetsWallet");
});

test("should make API call for groups", async ({ page }) => {
  await page.addInitScript(loginScript);
  await stubDataApiRequests(page);
  const requestPromise = page.waitForRequest("/api/portfolios/default/groups");
  await page.goto("/history");
  const request = await requestPromise;

  expect(request.method()).toBe("GET");
});

test("should make API call for history statistics", async ({ page }) => {
  await page.addInitScript(loginScript);
  await stubDataApiRequests(page);
  const requestPromise = page.waitForRequest(
    "/api/portfolios/default/history-statistics?withAssets=false"
  );
  await page.goto("/history");
  const request = await requestPromise;

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
  const requestPromise = page.waitForRequest(
    "/api/portfolios/default/history-statistics?*"
  );
  await page.goto("/history");
  await requestPromise;

  await page.waitForFunction(async () => {
    const dialog = document.querySelector(".MuiSnackbar-root .MuiAlert-root");
    return dialog?.getBoundingClientRect()?.width ?? 0 > 1;
  });

  await expect(page.locator(".MuiSnackbar-root .MuiAlert-root")).toBeVisible();
});

test("has period selector", async ({ page }) => {
  await page.addInitScript(loginScript);
  await stubDataApiRequests(page);
  await page.goto("/history");

  await expect(page.locator("[name=period]")).toBeVisible();
});

test("has Show Assets switch", async ({ page }) => {
  await page.addInitScript(loginScript);
  await stubDataApiRequests(page);
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
  const requestPromise = page.waitForRequest("/api/portfolios/default/groups");
  await page.goto("/history");
  await requestPromise;

  const groupSelector = page.locator("[name=group]").locator("..");
  await expect(groupSelector).toBeVisible();
  await groupSelector.click();
  await expect(page.locator("[role=option]")).toHaveCount(3);
  await expect(page.locator("[role=option]").nth(1)).toContainText("G1");
  await expect(page.locator("[role=option]").nth(2)).toContainText("G2");
});
