import { AssetBalanceChangeEntity } from './asset-balance-change.entity';
import { BalanceChangeModel } from './balance-change.model';

export type AnnualizedCalculation = {
  annualizedTwr: number | null;
  capitalChange?: number;
  profitChange?: number;
};

const periods = {
  '1M': 1,
  '1Y': 12,
  '3Y': 36,
};

export type PeriodCalculation = {
  [P in keyof typeof periods | 'total']?: AnnualizedCalculation | null;
};

const subtractMonths = (date: Date, months: number) => {
  const _date = new Date(date);
  _date.setMonth(_date.getMonth() - months);
  return _date;
};

export class PortfolioBalanceChangeSetModel {
  protected groupedAssetChanges: Record<string, AssetBalanceChangeEntity[]>;

  protected portfolioChanges: BalanceChangeModel[] = [];

  protected endDate: Date;

  constructor(changes: AssetBalanceChangeEntity[], endDate: Date) {
    this.endDate = endDate;
    this.setAllChanges(changes);
    this.setChangesPredecessors();
  }

  private setAllChanges(changes: AssetBalanceChangeEntity[]) {
    let lastDate: Date | undefined;
    changes.forEach((change) => {
      if (lastDate != null && change.date > lastDate) {
        this.saveChangeForPortfolio(lastDate);
      }
      this.groupedAssetChanges[change.assetId].push(change);
      lastDate = change.date;
    });
    if (lastDate != null) {
      this.saveChangeForPortfolio(lastDate);
    }
  }

  private saveChangeForPortfolio(date: Date) {
    let value = 0;
    let capital = 0;
    Object.entries(this.groupedAssetChanges).forEach(([, changes]) => {
      const lastChange = changes[changes.length - 1];
      value += lastChange.value;
      capital += lastChange.capital;
    });
    this.portfolioChanges.push(new BalanceChangeModel(value, capital, date));
  }

  private setChangesPredecessors() {
    [Object.values(this.groupedAssetChanges), this.portfolioChanges].forEach(
      (changes) => {
        let previousChange: BalanceChangeModel | null = null;
        changes.forEach((change) => {
          change.previousChange = previousChange;
          previousChange = change;
        });
      },
    );
  }

  private prepareCalculationForChanges(
    changes: BalanceChangeModel[],
    withCapitalAndProfit = true,
    monthsInPeriod?: number,
  ): AnnualizedCalculation | null {
    if (
      changes.length === 0 ||
      (changes.length === 1 && changes[0].previousChange === null)
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

  private calculateAnnualizedTwr(
    changes: BalanceChangeModel[],
    monthsInPeriod?: number,
  ): number | null {
    if (
      changes.length === 0 ||
      (changes.length === 1 && changes[0].previousChange == null) ||
      (monthsInPeriod == null && this.endDate == changes[0].date)
    ) {
      return null;
    }
    const daysDifference =
      (this.endDate.getTime() - changes[0].date.getTime()) /
      (1000 * 60 * 60 * 24);
    const pow =
      monthsInPeriod != null ? 12.0 / monthsInPeriod : 365 / daysDifference;
    return Math.pow(this.calculateTwr(changes) + 1.0, pow) - 1.0;
  }

  private calculateTwr(changes: BalanceChangeModel[]): number {
    const returns = changes.map((change) => change.getPeriodReturn());
    return (
      returns
        .filter((r) => r)
        .reduce((acc, returnChange) => acc * returnChange, 1.0) - 1.0
    );
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
      const periodChanges = changes.filter((change) => change.date > minDate);
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
}
