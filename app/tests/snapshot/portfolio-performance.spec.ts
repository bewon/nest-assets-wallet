import { expect, test } from "@playwright/test";
import { loginScript } from "../auth/auth.helper";
import { stubDataApiRequests } from "../api.helper";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(loginScript);
  await stubDataApiRequests(page);
});

test("has period selector", async ({ page }) => {
  await page.goto("/snapshot");
  await expect(
    page.locator("#portfolio-performance [name=period]")
  ).toBeVisible();
});

test("should make request for each group-performance", async ({ page }) => {
  const assets = [
    { id: "a0b1c2d3-532", name: "Asset A", group: "G1" },
    { id: "b0b1c2d3-533", name: "Asset B", group: "G2" },
  ];
  await page.route("/api/portfolios/default/assets-snapshot", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify(assets) })
  );
  await page.route("/api/portfolios/default/performance-statistics", (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({ portfolio: { "1Y": {} } }),
    })
  );
  const g1Promise = page.waitForRequest(
    "/api/portfolios/default/group-performance?group=G1"
  );
  const g2Promise = page.waitForRequest(
    "/api/portfolios/default/group-performance?group=G2"
  );
  await page.goto("/snapshot");
  const [g1Request, g2Request] = await Promise.all([g1Promise, g2Promise]);
  expect(g1Request).not.toBeNull();
  expect(g2Request).not.toBeNull();
});

test("has all groups and summary", async ({ page }) => {
  const assets = [
    { id: "a0b1c2d3-532", name: "Asset A", group: "G1" },
    { id: "b0b1c2d3-533", name: "Asset B", group: "G2" },
    { id: "c0b1c2d3-534", name: "Asset C", group: "G2" },
  ];
  await page.route("/api/portfolios/default/assets-snapshot", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify(assets) })
  );
  await page.route("/api/portfolios/default/performance-statistics", (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({ portfolio: { "1Y": {} } }),
    })
  );

  await page.goto("/snapshot");
  const listItems = await page.locator("#portfolio-performance > ul > li");
  await expect(listItems).toHaveCount(3);
  await expect(listItems.nth(0)).toContainText("G1");
  await expect(listItems.nth(1)).toContainText("G2");
});

test("should display proper performance data", async ({ page }) => {
  const assets = [
    { id: "a0b1c2d3-532", name: "Asset A", group: "G1" },
    { id: "b0b1c2d3-533", name: "Asset B", group: "G2" },
  ];
  const performance = {
    portfolio: {
      "1Y": {
        annualizedTwr: 0.0491,
        capitalChange: 22866,
        valueChange: 69803,
        profitChange: 42047,
      },
    },
  };
  const g1Performance = {
    portfolio: {
      "1Y": {
        annualizedTwr: 0.0563,
        capitalChange: 14861,
        valueChange: 53801,
        profitChange: 36041,
      },
    },
  };
  const g2Performance = {
    portfolio: {
      "1Y": {
        annualizedTwr: 0.0391,
        capitalChange: 8005,
        valueChange: 16002,
        profitChange: 8005,
      },
    },
  };
  await page.route("/api/portfolios/default/assets-snapshot", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify(assets) })
  );
  await page.route("/api/portfolios/default/performance-statistics", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify(performance) })
  );
  await page.route(
    "/api/portfolios/default/group-performance?group=G1",
    (route) =>
      route.fulfill({ status: 200, body: JSON.stringify(g1Performance) })
  );
  await page.route(
    "/api/portfolios/default/group-performance?group=G2",
    (route) =>
      route.fulfill({ status: 200, body: JSON.stringify(g2Performance) })
  );
  await page.goto("/snapshot");
  const listItems = await page.locator("#portfolio-performance > ul > li");

  await expect(listItems.nth(0)).toContainText("5.6%");
  await expect(listItems.nth(0)).toContainText("14,861");
  await expect(listItems.nth(0)).toContainText("53,801");
  await expect(listItems.nth(0)).toContainText("36,041");
  await expect(listItems.nth(1)).toContainText("3.9%");
  await expect(listItems.nth(1)).toContainText("8,005");
  await expect(listItems.nth(1)).toContainText("16,002");
  await expect(listItems.nth(1)).toContainText("8,005");
  await expect(listItems.nth(2)).toContainText("4.9%");
  await expect(listItems.nth(2)).toContainText("22,866");
  await expect(listItems.nth(2)).toContainText("69,803");
  await expect(listItems.nth(2)).toContainText("42,047");
});
