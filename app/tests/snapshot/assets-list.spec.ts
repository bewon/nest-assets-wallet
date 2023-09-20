import { test, expect, Dialog } from "@playwright/test";
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
});

test.describe("asset actions", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("/api/portfolios/default/assets-snapshot", (route) =>
      route.fulfill({ status: 200, body: JSON.stringify([assetA]) })
    );
    await page.goto("/snapshot");
    const assetMenu = page
      .locator("#assets-list [data-id='a0b1c2d3-532']")
      .getByRole("menu");
    await assetMenu.click();
  });

  test("should display menu for each asset", async ({ page }) => {
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

  test("should display balance update dialog when clicking on update asset balance", async ({
    page,
  }) => {
    await page.getByRole("menuitem").getByText("Update asset balance").click();
    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();
    await expect(dialog.locator("[name=date]")).toBeVisible();
    await expect(dialog.locator("[name=capital-current]")).toBeVisible();
    await expect(dialog.locator("[name=capital-plus]")).toBeVisible();
    await expect(dialog.locator("[name=capital-new]")).toBeVisible();
    await expect(dialog.locator("[name=value-current]")).toBeVisible();
    await expect(dialog.locator("[name=value-plus]")).toBeVisible();
    await expect(dialog.locator("[name=value-new]")).toBeVisible();
  });

  test("should submit update balance form with valid data using 'plus' fields", async ({
    page,
  }) => {
    await page.getByRole("menuitem").getByText("Update asset balance").click();
    const dialog = page.getByRole("dialog");
    await dialog.locator("[name=date]").fill("2022-01-01");
    await dialog.locator("[name=capital-plus]").fill("300");
    await dialog.locator("[name=value-plus]").fill("200");
    const clickPromise = dialog.locator("button[type=submit]").click();
    const updateAssetRequest = await page.waitForRequest(
      "/api/assets/a0b1c2d3-532/balance-changes"
    );
    await clickPromise;

    expect(updateAssetRequest.method()).toBe("POST");
    expect(updateAssetRequest.postDataJSON()).toEqual({
      date: "2022-01-01",
      capital: 9500,
      value: 9700,
    });
  });

  test("should update 'plus' fields in update balance form with valid data using 'new' fields", async ({
    page,
  }) => {
    await page.getByRole("menuitem").getByText("Update asset balance").click();
    const dialog = page.getByRole("dialog");
    await dialog.locator("[name=date]").fill("2022-01-01");
    await dialog.locator("[name=capital-new]").fill("9500");
    await dialog.locator("[name=value-new]").fill("9700");

    await expect(dialog.locator("[name=capital-plus]")).toHaveValue("300");
    await expect(dialog.locator("[name=value-plus]")).toHaveValue("200");
  });

  test("should display balance changes list dialog when clicking on asset balance changes list", async ({
    page,
  }) => {
    await page
      .getByRole("menuitem")
      .getByText("Asset balance changes list")
      .click();
    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Asset A");
  });

  test("should display whole balance changes list in balance changes list dialog", async ({
    page,
  }) => {
    const changes = [
      {
        id: "a0b1c2d3-561",
        capital: 7000,
        value: 7100,
        date: "2023-01-01",
      },
      {
        id: "b0b1c2d3-732",
        capital: 8000,
        value: 8500,
        date: "2023-02-01",
      },
      {
        id: "c0b1c2d3-622",
        capital: 9200,
        value: 9500,
        date: "2023-03-01",
      },
    ];
    await page.route("/api/assets/*/balance-changes*", (route) =>
      route.fulfill({ status: 200, body: JSON.stringify(changes) })
    );

    await page
      .getByRole("menuitem")
      .getByText("Asset balance changes list")
      .click();
    const dialog = page.getByRole("dialog");
    const dateInputs = dialog.locator("[name=date]");
    const capitalInputs = dialog.locator("[name=capital]");
    const valueInputs = dialog.locator("[name=value]");

    expect(await dateInputs.count()).toBe(3);
    await expect(dateInputs.nth(0)).toHaveValue("2023-01-01");
    await expect(dateInputs.nth(1)).toHaveValue("2023-02-01");
    await expect(dateInputs.nth(2)).toHaveValue("2023-03-01");
    expect(await capitalInputs.count()).toBe(3);
    await expect(capitalInputs.nth(0)).toHaveValue("7000");
    await expect(capitalInputs.nth(1)).toHaveValue("8000");
    await expect(capitalInputs.nth(2)).toHaveValue("9200");
    expect(await valueInputs.count()).toBe(3);
    await expect(valueInputs.nth(0)).toHaveValue("7100");
    await expect(valueInputs.nth(1)).toHaveValue("8500");
    await expect(valueInputs.nth(2)).toHaveValue("9500");
  });

  test("should be able to save change in balance changes list dialog", async ({
    page,
  }) => {
    await page.route("/api/assets/*/balance-changes*", (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: "a0b1c2d3-561",
            capital: 7000,
            value: 7100,
            date: "2023-01-01",
          },
        ]),
      })
    );

    await page
      .getByRole("menuitem")
      .getByText("Asset balance changes list")
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.locator("[name=date]").fill("2023-02-01");
    await dialog.locator("[name=capital]").fill("8000");
    await dialog.locator("[name=value]").fill("8500");

    const clickPromise = dialog.locator("[title='Save']").click();
    const updateChangeRequest = await page.waitForRequest(
      "/api/assets/a0b1c2d3-532/balance-changes/a0b1c2d3-561"
    );
    await clickPromise;

    expect(updateChangeRequest.method()).toBe("POST");
    expect(updateChangeRequest.postDataJSON()).toEqual({
      id: "a0b1c2d3-561",
      date: "2023-02-01",
      capital: 8000,
      value: 8500,
    });
  });

  test("should be able to delete change in balance changes list dialog", async ({
    page,
  }) => {
    await page.route("/api/assets/*/balance-changes*", (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify([{ id: "a0b1c2d3-561" }]),
      })
    );

    await page
      .getByRole("menuitem")
      .getByText("Asset balance changes list")
      .click();
    const dialog = page.getByRole("dialog");
    const clickPromise = dialog.locator("[title='Delete']").click();
    const deleteChangeRequest = await page.waitForRequest(
      "/api/assets/a0b1c2d3-532/balance-changes/a0b1c2d3-561"
    );
    await clickPromise;

    expect(deleteChangeRequest.method()).toBe("DELETE");
  });

  test("should display edit asset dialog when clicking on edit asset", async ({
    page,
  }) => {
    await page.getByRole("menuitem").getByText("Edit asset").click();
    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();
    await expect(dialog.locator("[name=name]")).toBeVisible();
    await expect(dialog.locator("[name=group]")).toBeVisible();
  });

  test("should submit edit asset form with valid data", async ({ page }) => {
    await page.getByRole("menuitem").getByText("Edit asset").click();
    const dialog = page.getByRole("dialog");
    await dialog.locator("[name=name]").fill("Asset X");
    await dialog.locator("[name=group]").fill("Y");
    const clickPromise = dialog.locator("button[type=submit]").click();
    const updateAssetRequest = await page.waitForRequest(
      "/api/assets/a0b1c2d3-532"
    );
    await clickPromise;

    expect(updateAssetRequest.method()).toBe("POST");
    expect(updateAssetRequest.postDataJSON()).toEqual({
      name: "Asset X",
      group: "Y",
    });
  });

  test("should delete asset when clicking on delete on edit asset dialog", async ({
    page,
  }) => {
    await page.getByRole("menuitem").getByText("Edit asset").click();
    let confirmDialog: Dialog | undefined;
    page.on("dialog", (dialog) => {
      confirmDialog = dialog;
      dialog.accept();
    });

    const dialog = page.getByRole("dialog");
    const clickPromise = dialog
      .locator("[type=button]")
      .getByText("Delete")
      .click();
    const deleteAssetRequest = await page.waitForRequest(
      "/api/assets/a0b1c2d3-532"
    );
    await clickPromise;

    expect(deleteAssetRequest.method()).toBe("DELETE");
    expect(confirmDialog?.type()).toBe("confirm");
  });
});
