export interface AssetSnapshot {
  id?: string;
  name?: string;
  group?: string;
  capital?: number;
  value?: number;
  profit?: number;
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
    annualizedTwr: Record<string, number | undefined>;
  }[];
};
