import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetEntity } from '../model/asset.entity';
import { Between, LessThanOrEqual, Repository } from 'typeorm';
import { AssetBalanceChangeEntity } from '../model/asset-balance-change.entity';
import { AssetSnapshotDto } from '../dto/asset-snapshot.dto';
import { PortfolioEntity } from '../model/portfolio.entity';

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
    date?: string,
  ): Promise<AssetSnapshotDto> {
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

  findById(id: string): Promise<AssetEntity | null> {
    return this.assetRepository.findOneBy({ id });
  }

  findGroupsForPortfolio(portfolio: PortfolioEntity): Promise<string[]> {
    return this.assetRepository
      .createQueryBuilder('asset')
      .select('asset.group', 'group')
      .distinct(true)
      .where('asset.portfolioId = :portfolioId', { portfolioId: portfolio.id })
      .getRawMany()
      .then((rows) =>
        rows.map((row) => row.group).filter((group) => group != null),
      );
  }

  findChangesInGivenYear(
    asset: AssetEntity,
    year: number,
  ): Promise<AssetBalanceChangeEntity[]> {
    const from = new Date(year, 0, 1).toISOString();
    const to = new Date(year, 11, 31, 23, 59, 59).toISOString();
    return this.assetBalanceChangeRepository.find({
      where: { assetId: asset.id, date: Between(from, to) },
      order: { date: 'ASC' },
    });
  }

  findAssetsForPortfolio(portfolio: PortfolioEntity): Promise<AssetEntity[]> {
    return this.assetRepository.findBy({ portfolioId: portfolio.id });
  }

  findPortfolioChanges(
    portfolio: PortfolioEntity,
    group?: string,
    date?: string,
  ): Promise<AssetBalanceChangeEntity[]> {
    const query = this.assetBalanceChangeRepository
      .createQueryBuilder('change')
      .leftJoin('change.asset', 'asset')
      .where('asset.portfolioId = :portfolioId', { portfolioId: portfolio.id });
    if (date != null) {
      query.andWhere('change.date <= :date', { date: date });
    }
    if (group != null) {
      query.andWhere('asset.group = :group', { group: group });
    }
    return query.orderBy('change.date', 'ASC').getMany();
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
    date: string,
  ): Promise<AssetBalanceChangeEntity | null> {
    return this.assetBalanceChangeRepository.findOne({
      where: { assetId: asset.id, date: LessThanOrEqual(date) },
      order: { date: 'DESC' },
    });
  }
}
