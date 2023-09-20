import { expect, test } from "@playwright/test";
import { loginScript } from "../auth/auth.helper";
import { stubDataApiRequests } from "../api.helper";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(loginScript);
  await stubDataApiRequests(page);
  const assets = [
    { id: "a0b1c2d3-532", name: "Asset A", group: "G1", value: 100 },
    { id: "b0b1c2d3-533", name: "Asset B", group: "G2", value: 200 },
    { id: "c0b1c2d3-534", name: "Asset C", group: "G2", value: 300 },
  ];
  await page.route("/api/portfolios/default/assets-snapshot", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify(assets) })
  );
});

test("has proper value", async ({ page }) => {
  await page.goto("/snapshot");

  await expect(page.locator("#portfolio-status")).toContainText("600");
});

test("has Details button", async ({ page }) => {
  await page.goto("/snapshot");

  await expect(page.locator("#portfolio-status button")).toBeVisible();
});

test("should show chart after click on Details button", async ({ page }) => {
  await page.goto("/snapshot");
  await page.locator("#portfolio-status button").click();

  await expect(page.getByRole("dialog").locator("canvas")).toBeVisible();
});
