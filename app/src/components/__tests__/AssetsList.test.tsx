import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useMediaQuery } from "@mui/material";
import AssetsList from "../AssetsList";
import { UserSettingsContext, UserSettings } from "../UserSettingsProvider";
import { AssetSnapshotInterface } from "@assets-wallet/api/src/portfolio/types";
import "@testing-library/jest-dom";

jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  useMediaQuery: jest.fn(),
}));

jest.mock("@src/utils/useFormat", () => ({
  __esModule: true,
  default: () => ({
    amountFormat: (value?: number) =>
      value != null ? `$${value.toFixed(2)}` : null,
    dateFormat: (date: Date) => date.toLocaleDateString(),
  }),
}));

jest.mock("@src/utils/theme", () => ({
  assetsPalette: ["#FF5722", "#2196F3", "#4CAF50", "#FF9800"],
}));

jest.mock("../NewAssetDialog", () => {
  return function MockNewAssetDialog(props: any) {
    return props.open ? (
      <div data-testid="new-asset-dialog">New Asset Dialog</div>
    ) : null;
  };
});

jest.mock("../EditAssetDialog", () => {
  return function MockEditAssetDialog(props: any) {
    return props.open ? (
      <div data-testid="edit-asset-dialog">Edit Asset Dialog</div>
    ) : null;
  };
});

jest.mock("../BalanceUpdateDialog", () => {
  return function MockBalanceUpdateDialog(props: any) {
    return props.open ? (
      <div data-testid="balance-update-dialog">Balance Update Dialog</div>
    ) : null;
  };
});

jest.mock("../ChangesListDialog", () => {
  return function MockChangesListDialog(props: any) {
    return props.open ? (
      <div data-testid="changes-list-dialog">Changes List Dialog</div>
    ) : null;
  };
});

const mockAssets: AssetSnapshotInterface[] = [
  {
    id: "1",
    name: "Apple Stock",
    capital: 1000,
    value: 1200,
    profit: 200,
    date: "2023-12-01T00:00:00Z",
    group: "Stocks",
  },
  {
    id: "2",
    name: "Bitcoin",
    capital: 5000,
    value: 0,
    profit: -5000,
    date: "2023-12-02T00:00:00Z",
    group: "Crypto",
  },
  {
    id: "3",
    name: "Savings Account",
    capital: 10000,
    value: 10100,
    profit: 100,
    date: "2023-12-03T00:00:00Z",
    group: "Bank",
  },
];

const defaultProps = {
  assets: mockAssets,
  handleSnackbar: jest.fn(),
  onDataRefresh: jest.fn(),
};

const renderWithUserSettings = (
  component: React.ReactElement,
  userSettings: Partial<UserSettings> = { hideZeroAssets: false },
) => {
  const fullUserSettings: UserSettings = {
    themeMode: "light",
    hideZeroAssets: false,
    ...userSettings,
  };
  return render(
    <UserSettingsContext.Provider value={fullUserSettings}>
      {component}
    </UserSettingsContext.Provider>,
  );
};

describe("AssetsList Component", () => {
  const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<
    typeof useMediaQuery
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render the assets list title", () => {
      mockUseMediaQuery.mockReturnValue(true);
      renderWithUserSettings(<AssetsList {...defaultProps} />);

      expect(screen.getByText("assetsList.title")).toBeInTheDocument();
    });

    it("should render the new asset button with tooltip", () => {
      mockUseMediaQuery.mockReturnValue(true);
      renderWithUserSettings(<AssetsList {...defaultProps} />);

      const newAssetButton = screen.getByRole("button", {
        name: "assetsList.newAsset",
      });
      expect(newAssetButton).toBeInTheDocument();
    });

    it("should show loading spinner when assets are undefined", () => {
      mockUseMediaQuery.mockReturnValue(false);
      renderWithUserSettings(
        <AssetsList {...defaultProps} assets={undefined} />,
      );

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("should render AssetsGrid on larger screens", () => {
      mockUseMediaQuery.mockReturnValue(true);
      renderWithUserSettings(<AssetsList {...defaultProps} />);

      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    it("should render List on smaller screens", () => {
      mockUseMediaQuery.mockReturnValue(false);
      renderWithUserSettings(<AssetsList {...defaultProps} />);

      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.getByText("Apple Stock")).toBeInTheDocument();
      expect(screen.getByText("Bitcoin")).toBeInTheDocument();
      expect(screen.getByText("Savings Account")).toBeInTheDocument();
    });
  });

  describe("Zero Assets Filtering", () => {
    it("should show all assets when hideZeroAssets is false", () => {
      mockUseMediaQuery.mockReturnValue(false);
      renderWithUserSettings(<AssetsList {...defaultProps} />, {
        hideZeroAssets: false,
      });

      expect(screen.getByText("Apple Stock")).toBeInTheDocument();
      expect(screen.getByText("Bitcoin")).toBeInTheDocument();
      expect(screen.getByText("Savings Account")).toBeInTheDocument();
    });

    it("should hide zero value assets when hideZeroAssets is true", () => {
      mockUseMediaQuery.mockReturnValue(false);
      renderWithUserSettings(<AssetsList {...defaultProps} />, {
        hideZeroAssets: true,
      });

      expect(screen.getByText("Apple Stock")).toBeInTheDocument();
      expect(screen.queryByText("Bitcoin")).not.toBeInTheDocument();
      expect(screen.getByText("Savings Account")).toBeInTheDocument();
    });
  });

  describe("Dialog Interactions", () => {
    it("should open new asset dialog when new asset button is clicked", () => {
      mockUseMediaQuery.mockReturnValue(true);
      renderWithUserSettings(<AssetsList {...defaultProps} />);

      const newAssetButton = screen.getByRole("button", {
        name: "assetsList.newAsset",
      });
      fireEvent.click(newAssetButton);

      expect(screen.getByTestId("new-asset-dialog")).toBeInTheDocument();
    });

    it("should open edit dialog when edit action is triggered", async () => {
      mockUseMediaQuery.mockReturnValue(false);
      renderWithUserSettings(<AssetsList {...defaultProps} />);

      const moreButtons = screen.getAllByTestId("MoreVertIcon");
      fireEvent.click(moreButtons[0].closest("button")!);

      const editMenuItem = screen.getByText("assetsList.menu.edit");
      fireEvent.click(editMenuItem);

      await waitFor(() => {
        expect(screen.getByTestId("edit-asset-dialog")).toBeInTheDocument();
      });
    });

    it("should open balance update dialog when balance update action is triggered", async () => {
      mockUseMediaQuery.mockReturnValue(false);
      renderWithUserSettings(<AssetsList {...defaultProps} />);

      const moreButtons = screen.getAllByTestId("MoreVertIcon");
      fireEvent.click(moreButtons[0].closest("button")!);

      const balanceUpdateMenuItem = screen.getByText(
        "assetsList.menu.balanceUpdate",
      );
      fireEvent.click(balanceUpdateMenuItem);

      await waitFor(() => {
        expect(screen.getByTestId("balance-update-dialog")).toBeInTheDocument();
      });
    });

    it("should open changes list dialog when changes list action is triggered", async () => {
      mockUseMediaQuery.mockReturnValue(false);
      renderWithUserSettings(<AssetsList {...defaultProps} />);

      const moreButtons = screen.getAllByTestId("MoreVertIcon");
      fireEvent.click(moreButtons[0].closest("button")!);

      const changesListMenuItem = screen.getByText(
        "assetsList.menu.changesList",
      );
      fireEvent.click(changesListMenuItem);

      await waitFor(() => {
        expect(screen.getByTestId("changes-list-dialog")).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty assets array", () => {
      mockUseMediaQuery.mockReturnValue(false);
      renderWithUserSettings(<AssetsList {...defaultProps} assets={[]} />);

      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.queryByText("Apple Stock")).not.toBeInTheDocument();
    });

    it("should handle assets with undefined values", () => {
      const assetsWithUndefineds: AssetSnapshotInterface[] = [
        { id: "1", name: "Test Asset" },
      ];

      mockUseMediaQuery.mockReturnValue(false);
      renderWithUserSettings(
        <AssetsList {...defaultProps} assets={assetsWithUndefineds} />,
      );

      expect(screen.getByText("Test Asset")).toBeInTheDocument();
    });
  });

  describe("AssetsGrid Integration", () => {
    it("should render grid with correct columns on desktop", () => {
      mockUseMediaQuery.mockReturnValue(true);
      renderWithUserSettings(<AssetsList {...defaultProps} />);

      const grid = screen.getByRole("grid");
      expect(grid).toBeInTheDocument();

      expect(screen.getByText("Apple Stock")).toBeInTheDocument();
      expect(screen.getByText("Bitcoin")).toBeInTheDocument();
    });

    it("should handle grid actions properly", () => {
      mockUseMediaQuery.mockReturnValue(true);
      renderWithUserSettings(<AssetsList {...defaultProps} />);

      expect(screen.getByRole("grid")).toBeInTheDocument();
      expect(screen.getByText("Apple Stock")).toBeInTheDocument();
    });
  });

  describe("NarrowAssetsListItem Integration", () => {
    it("should display asset summary in narrow view", () => {
      mockUseMediaQuery.mockReturnValue(false);
      renderWithUserSettings(<AssetsList {...defaultProps} />);

      expect(screen.getByText("Apple Stock")).toBeInTheDocument();

      expect(screen.getByText("$1000.00")).toBeInTheDocument();
      expect(screen.getByText("$1200.00")).toBeInTheDocument();
    });
  });
});
