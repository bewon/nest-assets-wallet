import { test, expect } from "@playwright/test";
import { loginScript } from "../auth/auth.helper";
import { stubDataApiRequests } from "../api.helper";

test("has title", async ({ page }) => {
  await page.addInitScript(loginScript);
  await stubDataApiRequests(page);
  await page.goto("/snapshot");

  await expect(page).toHaveTitle("Portfolio snapshot | AssetsWallet");
});

test("should make API call for assets snapshot", async ({ page }) => {
  await page.addInitScript(loginScript);
  await stubDataApiRequests(page);
  const gotoPromise = page.goto("/snapshot");
  const request = await page.waitForRequest(
    "/api/portfolios/default/assets-snapshot"
  );
  await gotoPromise;

  expect(request.method()).toBe("GET");
});

test("should make API call for performance statistics", async ({ page }) => {
  await page.addInitScript(loginScript);
  await stubDataApiRequests(page);
  const gotoPromise = page.goto("/snapshot");
  const request = await page.waitForRequest(
    "/api/portfolios/default/performance-statistics"
  );
  await gotoPromise;

  expect(request.method()).toBe("GET");
});

test("should display error message when API call fails", async ({ page }) => {
  await page.addInitScript(loginScript);
  await page.route("/api/portfolios/default/assets-snapshot", (route) =>
    route.fulfill({ status: 500 })
  );
  await page.route("/api/portfolios/default/performance-statistics", (route) =>
    route.fulfill({ status: 200 })
  );
  await page.goto("/snapshot");
  await page.waitForFunction(async () => {
    const dialog = document.querySelector(".MuiSnackbar-root .MuiAlert-root");
    return dialog?.getBoundingClientRect()?.width ?? 0 > 1;
  });

  await expect(page.locator(".MuiSnackbar-root .MuiAlert-root")).toBeVisible();
});
