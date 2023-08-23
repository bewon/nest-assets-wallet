import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
});

test("has title", async ({ page }) => {
  await expect(page).toHaveTitle(/AssetsWallet/);
});

test("has progress component with progressbar role", async ({ page }) => {
  await expect(page.getByRole("progressbar")).toBeVisible();
});

test("should be redirected to /auth/login if session is missing", async ({
  page,
}) => {
  await page.evaluate(() => {
    localStorage.removeItem("session-data");
  });

  await page.waitForTimeout(1000);

  expect(page.url()).toBe("http://localhost:3000/auth/login");
});
test("should be redirected to /snapshot if session is missing", async ({
  page,
}) => {
  await page.evaluate(() => {
    localStorage.setItem(
      "session-data",
      JSON.stringify({ accessToken: "hbgujbngfu", userEmail: "test@bewon.eu" })
    );
  });

  await page.waitForTimeout(1000);

  expect(page.url()).toBe("http://localhost:3000/snapshot");
});
