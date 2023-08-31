import { Page } from "@playwright/test";

export async function stubDataApiRequests(page: Page) {
  await page.route("/api/portfolios/default/assets-snapshot", (route) =>
    route.fulfill({ status: 200 })
  );
  await page.route("/api/portfolios/default/performance-statistics", (route) =>
    route.fulfill({ status: 200 })
  );
  await page.route("/api/portfolios/default/group-performance?*", (route) =>
    route.fulfill({ status: 200 })
  );
}
