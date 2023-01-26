import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetEntity } from '../entity/asset.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import { AssetBalanceChangeEntity } from '../entity/asset-balance-change.entity';
import { AssetSnapshotDto } from '../dto/asset-snapshot.dto';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
    @InjectRepository(AssetBalanceChangeEntity)
    private readonly assetBalanceChangeRepository: Repository<AssetBalanceChangeEntity>,
  ) {}

  async prepareAssetSnapshot(
    asset: AssetEntity,
    date?: Date,
  ): Promise<AssetSnapshotDto | null> {
    const change =
      date == null
        ? await this.findLastChangeForAsset(asset)
        : await this.findChangeForAsset(asset, date);
    const snapshot = new AssetSnapshotDto();
    snapshot.id = asset.id;
    snapshot.name = asset.name;
    snapshot.group = asset.group;
    snapshot.capital = change?.capital;
    snapshot.value = change?.value;
    snapshot.profit = change?.getProfit();
    snapshot.date = change?.date;
    return snapshot;
  }

  private findLastChangeForAsset(
    asset: AssetEntity,
  ): Promise<AssetBalanceChangeEntity | null> {
    return this.assetBalanceChangeRepository.findOne({
      where: { assetId: asset.id },
      order: { date: 'DESC' },
    });
  }

  private findChangeForAsset(
    asset: AssetEntity,
    date: Date,
  ): Promise<AssetBalanceChangeEntity | null> {
    return this.assetBalanceChangeRepository.findOne({
      where: { assetId: asset.id, date: LessThanOrEqual(date) },
      order: { date: 'DESC' },
    });
  }
}
