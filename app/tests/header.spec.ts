import { expect, test } from "@playwright/test";
import { loginScript } from "./auth/auth.helper";
import { stubDataApiRequests } from "./api.helper";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(loginScript);
  await stubDataApiRequests(page);
  await page.goto("/");
});

test("has tab navigation", async ({ page }) => {
  const tabNavigation = page.locator("#header [role=tablist]");
  const tabNavigationItems = tabNavigation.locator("[role=tab]");

  await expect(tabNavigation).toBeVisible();
  await expect(tabNavigationItems).toHaveCount(2);
  await expect(tabNavigationItems.nth(0)).toHaveText("Today");
  await expect(tabNavigationItems.nth(1)).toHaveText("History");
});

test("should display first tab in navigation by default", async ({ page }) => {
  await expect(page.locator("#header [role=tab]").first()).toHaveAttribute(
    "aria-selected",
    "true"
  );
});

test("should change url when second tab is clicked", async ({ page }) => {
  await page.locator("#header [role=tab]").nth(1).click();

  await expect(page).toHaveURL("/history");
});

test("has Settings button", async ({ page }) => {
  await expect(page.locator("#header").getByLabel("Settings")).toBeVisible();
});
test("should open Settings menu when Settings button is clicked", async ({
  page,
}) => {
  await page.locator("#header").getByLabel("Settings").click();
  const menuItems = page.locator("ul[role=menu] > li");
  await expect(menuItems).toHaveCount(4);
  await expect(menuItems.nth(0).getByLabel("Language")).toBeVisible();
  await expect(menuItems.nth(1).getByLabel("Theme")).toBeVisible();
  await expect(
    menuItems.nth(2).locator("[name=hide-zero-assets]")
  ).toBeVisible();
  await expect(menuItems.nth(3).getByText("Log out")).toBeVisible();
});

test("should log out when Log out menu item is clicked", async ({ page }) => {
  await page.locator("#header").getByLabel("Settings").click();
  await page.locator("ul[role=menu] > li").nth(3).locator("button").click();

  await expect(page).toHaveURL("/auth/login");
});
