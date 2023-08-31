import { test, expect } from "@playwright/test";
import { loginScript } from "../auth/auth.helper";
import { stubDataApiRequests } from "../api.helper";

const assetA = {
  id: "a0b1c2d3-532",
  name: "Asset A",
  group: "G1",
  capital: 9200,
  value: 9500,
  profit: 300,
  date: "2022-01-01",
};

const assetB = {
  id: "b0b1c2d3-7e2",
  name: "Asset B",
  group: "G1",
  capital: -1000,
  value: 100,
  profit: 1100,
  date: "2013-01-31",
};

const zeroValueAsset = {
  id: "c0b1c2d3-641",
  name: "Asset C",
  group: "G1",
  capital: 1000,
  value: 0,
  profit: 1000,
  date: "2013-01-31",
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(loginScript);
  await stubDataApiRequests(page);
});

test("has new assets button", async ({ page }) => {
  await page.goto("/snapshot");

  await expect(page.locator("#assets-list #new-asset-button")).toBeVisible();
});

test.describe("new asset dialog", () => {
  test("should display dialog when clicking on new asset button", async ({
    page,
  }) => {
    await page.goto("/snapshot");
    await page.click("#assets-list #new-asset-button");

    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("should display form with all fields", async ({ page }) => {
    await page.goto("/snapshot");
    await page.click("#assets-list #new-asset-button");
    const dialog = page.getByRole("dialog");

    await expect(dialog.locator("[name=Name]")).toBeVisible();
    await expect(dialog.locator("[name=Date]")).toBeVisible();
    await expect(dialog.locator("[name=Capital]")).toBeVisible();
    await expect(dialog.locator("[name=Value]")).toBeVisible();
  });

  test("should submit form with valid data", async ({ page }) => {
    await page.goto("/snapshot");
    await page.click("#assets-list #new-asset-button");
    const dialog = page.getByRole("dialog");
    await dialog.locator("[name=Name]").fill("Asset A");
    await dialog.locator("[name=Date]").fill("2022-01-01");
    await dialog.locator("[name=Capital]").fill("9200");
    await dialog.locator("[name=Value]").fill("9500");
    const clickPromise = dialog.locator("button[type=submit]").click();
    const newAssetRequest = await page.waitForRequest(
      "/api/portfolios/default/assets"
    );
    await clickPromise;

    expect(newAssetRequest.method()).toBe("POST");
    expect(newAssetRequest.postDataJSON()).toEqual({
      name: "Asset A",
      date: "2022-01-01",
      capital: 9200,
      value: 9500,
    });
  });
});

test.describe("assets list elements", () => {
  test("has all assets on list", async ({ page }) => {
    await page.route("/api/portfolios/default/assets-snapshot", (route) =>
      route.fulfill({ status: 200, body: JSON.stringify([assetA, assetB]) })
    );
    await page.goto("/snapshot");

    await expect(
      page.locator("#assets-list [data-id='a0b1c2d3-532']")
    ).toBeVisible();
    await expect(
      page.locator("#assets-list [data-id='b0b1c2d3-7e2']")
    ).toBeVisible();
  });

  test("shouldn't display assets with zero value by default", async ({
    page,
  }) => {
    await page.route("/api/portfolios/default/assets-snapshot", (route) =>
      route.fulfill({ status: 200, body: JSON.stringify([zeroValueAsset]) })
    );
    await page.goto("/snapshot");

    await expect(
      page.locator("#assets-list [data-id='c0b1c2d3-641']")
    ).not.toBeVisible();
  });

  test("should display assets with zero value when setting in local storage is set", async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem(
        "user-settings.hide-zero-assets",
        JSON.stringify(false)
      )
    );
    await page.route("/api/portfolios/default/assets-snapshot", (route) =>
      route.fulfill({ status: 200, body: JSON.stringify([zeroValueAsset]) })
    );
    await page.goto("/snapshot");

    await expect(
      page.locator("#assets-list [data-id='c0b1c2d3-641']")
    ).toBeVisible();
  });

  test("should display assets name", async ({ page }) => {
    await page.route("/api/portfolios/default/assets-snapshot", (route) =>
      route.fulfill({ status: 200, body: JSON.stringify([assetA]) })
    );
    await page.goto("/snapshot");

    await expect(
      page.locator("#assets-list [data-id='a0b1c2d3-532'] [title='Asset A']")
    ).toHaveText("Asset A");
  });

  test("should display menu for each asset", async ({ page }) => {
    await page.route("/api/portfolios/default/assets-snapshot", (route) =>
      route.fulfill({ status: 200, body: JSON.stringify([assetA]) })
    );
    await page.goto("/snapshot");

    const menu = page
      .locator("#assets-list [data-id='a0b1c2d3-532']")
      .getByRole("menu");
    await menu.click();

    await expect(
      page.getByRole("menuitem").getByText("Update asset balance")
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem").getByText("Asset balance changes list")
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem").getByText("Edit asset")
    ).toBeVisible();
  });
});
