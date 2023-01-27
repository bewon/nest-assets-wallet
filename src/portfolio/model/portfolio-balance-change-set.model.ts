import { AssetBalanceChangeEntity } from './asset-balance-change.entity';
import { BalanceChangeModel } from './balance-change.model';

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
}
