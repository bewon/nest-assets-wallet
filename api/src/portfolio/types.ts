export interface AssetSnapshotInterface {
  id?: string;
  name?: string;
  group?: string;
  capital?: number;
  value?: number;
  profit?: number;
  date?: string;
}

export interface AssetBalanceChangeInterface {
  id?: string;
  capital?: number;
  value?: number;
  date?: string;
}

export type AnnualizedCalculation = {
  annualizedTwr?: number;
  capitalChange?: number;
  valueChange?: number;
  profitChange?: number;
};

export type PortfolioPerformanceStatistics = {
  portfolio: Record<string, AnnualizedCalculation | undefined>;
  assets?: {
    id: string;
    performance: Record<string, AnnualizedCalculation | undefined>;
  }[];
};

export type HistoryStatistics = {
  portfolio: TransformedHistoryStatistics;
  assets?: AssetHistoryStatistics[];
};

export type TransformedHistoryStatistics = Array<
  [string, number, number, number, number | null, ...Array<number | null>]
>;

export type AssetHistoryStatistics = {
  id: string;
  name?: string;
  group?: string;
  values: TransformedHistoryStatistics;
  value?: number;
  capital?: number;
};
