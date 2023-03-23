import { AssetBalanceChangeInterface } from '../types';
import { AssetBalanceChangeEntity } from '../model/asset-balance-change.entity';

export class AssetBalanceChangeDto implements AssetBalanceChangeInterface {
  id?: string;
  capital?: number;
  value?: number;
  date?: string;

  constructor(assetBalanceChangeEntity: AssetBalanceChangeEntity) {
    this.id = assetBalanceChangeEntity.id;
    this.capital = assetBalanceChangeEntity.capital;
    this.value = assetBalanceChangeEntity.value;
    this.date = assetBalanceChangeEntity.date;
  }
}
