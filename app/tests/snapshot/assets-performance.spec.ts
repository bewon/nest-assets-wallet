import { expect, test } from "@playwright/test";
import { loginScript } from "../auth/auth.helper";
import { stubDataApiRequests } from "../api.helper";

const assets = [
  { id: "a0b1c2d3-532", name: "Asset A", group: "G1", value: 10000 },
  { id: "b0b1c2d3-533", name: "Asset B", group: "G2", value: 12000 },
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
  assets: [
    {
      id: "a0b1c2d3-532",
      performance: {
        "1Y": {
          annualizedTwr: 0.0563,
          capitalChange: 14861,
          valueChange: 53801,
          profitChange: 36041,
        },
      },
    },
    {
      id: "b0b1c2d3-533",
      performance: {
        "1Y": {
          annualizedTwr: 0.0391,
          capitalChange: 8005,
          valueChange: 16002,
          profitChange: 8005,
        },
      },
    },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(loginScript);
  await stubDataApiRequests(page);
  await page.route("/api/portfolios/default/assets-snapshot", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify(assets) })
  );
  await page.route("/api/portfolios/default/performance-statistics", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify(performance) })
  );
});

test("has period selector", async ({ page }) => {
  await page.goto("/snapshot");
  await expect(page.locator("#assets-performance [name=period]")).toBeVisible();
});

test("should display proper assets performance data", async ({ page }) => {
  await page.goto("/snapshot");
  const listItems = page.locator("#assets-performance > ul > li");

  await expect(listItems).toHaveCount(2);
  await expect(listItems.nth(0)).toContainText("Asset A");
  await expect(listItems.nth(0)).toContainText("5.6%");
  await expect(listItems.nth(0)).toContainText("14,861");
  await expect(listItems.nth(0)).toContainText("53,801");
  await expect(listItems.nth(1)).toContainText("Asset B");
  await expect(listItems.nth(1)).toContainText("3.9%");
  await expect(listItems.nth(1)).toContainText("8,005");
  await expect(listItems.nth(1)).toContainText("16,002");
});
