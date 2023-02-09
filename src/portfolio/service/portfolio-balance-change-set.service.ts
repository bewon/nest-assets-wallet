import { AssetBalanceChangeEntity } from '../model/asset-balance-change.entity';
import { BalanceChangeModel } from '../model/balance-change.model';
import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { defaultDateFormat } from '../../app.module';

export type AnnualizedCalculation = {
  annualizedTwr?: number;
  capitalChange?: number;
  profitChange?: number;
};

export const periods = {
  '1M': 1,
  '1Y': 12,
  '3Y': 36,
};

export type PeriodCalculation = {
  [P in keyof typeof periods | 'total']?: AnnualizedCalculation | null;
};

export type PeriodHistory = {
  change: BalanceChangeModel;
  periodCalculation: PeriodCalculation;
}[];

const subtractMonths = (date: string, months: number): string => {
  const _date = dayjs(date).subtract(months, 'months');
  return _date.format(defaultDateFormat);
};

// This class is for calculate statistics from set of AssetBalanceChanges for Portfolio
// This code will work ony for changes sorted by date!
@Injectable()
export class PortfolioBalanceChangeSetService {
  protected groupedAssetChanges: Record<string, AssetBalanceChangeEntity[]> =
    {};

  protected portfolioChanges: BalanceChangeModel[] = [];

  public endDate: string;

  // Divide changes into grouped assets changes and summed portfolio assets
  setAllChanges(changes: AssetBalanceChangeEntity[]) {
    let lastDate: string | undefined;
    changes.forEach((change) => {
      // if date is switched then portfolio change needs to be calculated
      if (lastDate != null && Date.parse(change.date) > Date.parse(lastDate)) {
        this.saveChangeForPortfolio(lastDate);
      }
      this.groupedAssetChanges[change.assetId] ??= [];
      this.groupedAssetChanges[change.assetId].push(change);
      lastDate = change.date;
    });
    if (lastDate != null) {
      this.saveChangeForPortfolio(lastDate);
    }
    this.setChangesPredecessors();
  }

  // prepare calculations (e.g. TWR, capital change, profit change) for whole Portfolio
  prepareCalculationsForPortfolio(
    withCapitalAndProfit = true,
  ): PeriodCalculation {
    return this.prepareCalculationForPeriods(
      this.portfolioChanges,
      withCapitalAndProfit,
    );
  }

  // prepare calculations (e.g. TWR, capital change, profit change) for all Portfolio Assets
  prepareCalculationsForAssets(
    withCapitalAndProfit = true,
  ): Record<string, PeriodCalculation> {
    const calculations: Record<string, PeriodCalculation> = {};
    Object.entries(this.groupedAssetChanges)
      .sort(([id1], [id2]) => id1.localeCompare(id2))
      .forEach(([assetId, changes]) => {
        calculations[assetId] = this.prepareCalculationForPeriods(
          changes,
          withCapitalAndProfit,
        );
      });
    return calculations;
  }

  // prepare history/statistics for whole Portfolio
  prepareHistoryForPortfolio(): PeriodHistory {
    return this.prepareHistoryForPeriods(this.portfolioChanges);
  }

  // prepare history/statistics for all Portfolio Assets
  prepareHistoryForAssets(): Record<string, PeriodHistory> {
    const historyForAssets: Record<string, PeriodHistory> = {};
    Object.entries(this.groupedAssetChanges).forEach(([assetId, changes]) => {
      historyForAssets[assetId] = this.prepareHistoryForPeriods(changes);
    });
    return historyForAssets;
  }

  // It will set previousChange for all changes to make calculations easier
  private setChangesPredecessors() {
    [...Object.values(this.groupedAssetChanges), this.portfolioChanges].forEach(
      (changes) => {
        let previousChange: BalanceChangeModel | null = null;
        changes.forEach((change) => {
          change.previousChange = previousChange;
          previousChange = change;
        });
      },
    );
  }

  // sum last changes for assets and create portfolio change
  private saveChangeForPortfolio(date: string) {
    let value = 0;
    let capital = 0;
    Object.entries(this.groupedAssetChanges).forEach(([, changes]) => {
      const lastChange = changes[changes.length - 1];
      value += lastChange.value;
      capital += lastChange.capital;
    });
    this.portfolioChanges.push(new BalanceChangeModel(capital, value, date));
  }

  // make calculations (TWR, capital change, profit change) for all given changes and sub-periods of changes
  private prepareCalculationForPeriods(
    changes: BalanceChangeModel[],
    withCapitalAndProfit = true,
  ): PeriodCalculation {
    const calculation: PeriodCalculation = {
      total: this.prepareCalculationForChanges(changes, withCapitalAndProfit),
    };
    Object.entries(periods).forEach(([period, months]) => {
      const minDate = subtractMonths(this.endDate, months);
      const periodChanges = changes.filter(
        (change) => Date.parse(change.date) > Date.parse(minDate),
      );
      // if all changes are in periodChanges then there is no need to calculate it, because it is the same like 'total'
      calculation[period] =
        periodChanges.length < changes.length
          ? this.prepareCalculationForChanges(
              periodChanges,
              withCapitalAndProfit,
              months,
            )
          : calculation.total;
    });
    return calculation;
  }

  // calculate total TWR (True time-weighted rate of return) of changes
  private calculateTwr(changes: BalanceChangeModel[]): number {
    const returns = changes
      .map((change) => change.getPeriodReturn())
      .filter((r) => r != null) as number[];
    return returns.reduce((acc, returnChange) => acc * returnChange, 1.0) - 1.0;
  }

  // make calculations (TWR, capital change, profit change) for given changes in period
  private prepareCalculationForChanges(
    changes: BalanceChangeModel[],
    withCapitalAndProfit = true,
    monthsInPeriod?: number,
  ): AnnualizedCalculation | null {
    if (
      changes.length === 0 ||
      (changes.length === 1 && changes[0].previousChange == null)
    ) {
      return null;
    }
    const calculation: AnnualizedCalculation = {
      annualizedTwr: this.calculateAnnualizedTwr(changes, monthsInPeriod),
    };
    if (withCapitalAndProfit) {
      const oldestChange = changes[0].previousChange || changes[0];
      const lastChange = changes[changes.length - 1];
      calculation.capitalChange = lastChange.capital - oldestChange.capital;
      calculation.profitChange =
        lastChange.getProfit() - oldestChange.getProfit();
    }
    return calculation;
  }

  // make statistics/calculations for all historical dates for given changes in period
  private prepareHistoryForPeriods(
    changes: BalanceChangeModel[],
  ): PeriodHistory {
    const pastChanges: BalanceChangeModel[] = [];
    const endDate = this.endDate;
    const history = changes.map((change) => {
      pastChanges.push(change);
      this.endDate = change.date;
      return {
        change,
        periodCalculation: this.prepareCalculationForPeriods(
          pastChanges,
          false,
        ),
      };
    });
    this.endDate = endDate;
    return history;
  }

  // calculate TWR that is annualized by given number of months or in relation to this.endDate
  private calculateAnnualizedTwr(
    changes: BalanceChangeModel[],
    monthsInPeriod?: number,
  ): number | undefined {
    if (
      changes.length === 0 ||
      (changes.length === 1 && changes[0].previousChange == null) ||
      (monthsInPeriod == null && this.endDate == changes[0].date)
    ) {
      return undefined;
    }
    const daysDifference =
      (Date.parse(this.endDate) - Date.parse(changes[0].date)) /
      (1000 * 60 * 60 * 24);
    const pow =
      monthsInPeriod != null ? 12.0 / monthsInPeriod : 365 / daysDifference;
    return Math.pow(this.calculateTwr(changes) + 1.0, pow) - 1.0;
  }
}
