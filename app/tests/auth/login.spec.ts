import { test, expect } from "@playwright/test";
import { stubDataApiRequests } from "../api.helper";

test("has title", async ({ page }) => {
  await page.goto("/auth/login");

  await expect(page).toHaveTitle("Log in | AssetsWallet");
});

test.describe("login form", () => {
  test("should log in with valid API response", async ({ page }) => {
    await stubDataApiRequests(page);
    await page.route("/api/auth/login", (route) => {
      route.fulfill({
        status: 200,
        body: '{ "accessToken": "hbgujbngfu", "userEmail": "test@bewon.eu" }',
      });
    });
    await page.goto("/auth/login");
    await page.locator("#email").fill("test@bewon.eu");
    await page.locator("#password").fill("test");
    const clickPromise = page.locator("button[type=submit]").click();
    const request = await page.waitForRequest("/api/auth/login");
    await clickPromise;

    expect(request.method()).toBe("POST");
    expect(request.postDataJSON()).toEqual({
      email: "test@bewon.eu",
      password: "test",
    });
    await expect(page).toHaveURL("/");
  });

  test("should show an error message with invalid API response", async ({
    page,
  }) => {
    await page.route("/api/auth/login", (route) => {
      route.fulfill({ status: 500 });
    });
    await page.goto("/auth/login");
    await page.locator("#email").fill("test@bewon.eu");
    await page.locator("#password").fill("test");
    await page.locator("button[type=submit]").click();
    await page.waitForFunction(async () => {
      const dialog = document.querySelector(".MuiSnackbar-root .MuiAlert-root");
      return dialog?.getBoundingClientRect()?.width ?? 0 > 1;
    });

    await expect(
      page.locator(".MuiSnackbar-root .MuiAlert-root")
    ).toBeVisible();
  });
});

test.describe("locale switcher", () => {
  test("should show a list of available locales", async ({ page }) => {
    await page.goto("/auth/login");
    const switcher = page.locator("[id=locale-switcher]");

    await expect(switcher.getByText("english")).toBeVisible();
    await expect(switcher.getByText("polski")).toBeVisible();
  });

  test("should change locale to pl", async ({ page }) => {
    await page.goto("/auth/login");
    await page.locator("[id=locale-switcher] a").getByText("polski").click();

    await expect(page).toHaveURL("/pl/auth/login");
  });

  test("should change locale to en", async ({ page }) => {
    await page.goto("/pl/auth/login");
    const link = page.locator("[id=locale-switcher] a").getByText("english");
    await expect(link).toHaveAttribute("href", "/auth/login");

    await link.click();
    await expect(page).toHaveURL("/auth/login");
  });
});
