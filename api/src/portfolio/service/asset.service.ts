import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetEntity } from '../model/asset.entity';
import { Between, LessThanOrEqual, Repository } from 'typeorm';
import { AssetBalanceChangeEntity } from '../model/asset-balance-change.entity';
import { AssetSnapshotDto } from '../dto/asset-snapshot.dto';
import { PortfolioEntity } from '../model/portfolio.entity';
import { CreateAssetDto } from '../dto/create-asset.dto';
import { UpdateAssetDto } from '../dto/update-asset.dto';
import { CreateBalanceChangeDto } from '../dto/create-balance-change.dto';
import { UpdateBalanceChangeDto } from '../dto/update-balance-change.dto';
import { AssetBalanceChangeDto } from '../dto/asset-balance-change.dto';

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

  async findChangesInGivenYear(
    asset: AssetEntity,
    year: number,
  ): Promise<AssetBalanceChangeDto[]> {
    const from = new Date(year, 0, 1).toISOString();
    const to = new Date(year, 11, 31, 23, 59, 59).toISOString();
    const entities = await this.assetBalanceChangeRepository.find({
      where: { assetId: asset.id, date: Between(from, to) },
      order: { date: 'ASC' },
    });
    return entities.map((change) => new AssetBalanceChangeDto(change));
  }

  async findAllChanges(asset: AssetEntity): Promise<AssetBalanceChangeDto[]> {
    const entities = await this.assetBalanceChangeRepository.find({
      where: { assetId: asset.id },
      order: { date: 'ASC' },
    });
    return entities.map((change) => new AssetBalanceChangeDto(change));
  }

  findAssetsForPortfolio(portfolio: PortfolioEntity): Promise<AssetEntity[]> {
    return this.assetRepository.find({
      where: { portfolioId: portfolio.id },
      order: { createdAt: 'ASC' },
    });
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

  async create(portfolioId: string, createAssetDto: CreateAssetDto) {
    const asset = new AssetEntity();
    asset.portfolioId = portfolioId;
    asset.name = createAssetDto.name;
    const change = new AssetBalanceChangeEntity(
      createAssetDto.capital,
      createAssetDto.value,
      createAssetDto.date,
    );
    asset.balanceChanges = [change];
    return this.assetRepository.save(asset);
  }

  async createChange(
    asset: AssetEntity,
    createBalanceChangeDto: CreateBalanceChangeDto,
  ) {
    const change = new AssetBalanceChangeEntity(
      createBalanceChangeDto.capital,
      createBalanceChangeDto.value,
      createBalanceChangeDto.date,
    );
    change.asset = asset;
    return this.assetBalanceChangeRepository.save(change);
  }

  async update(asset: AssetEntity, updateAssetDto: UpdateAssetDto) {
    asset.name = updateAssetDto.name;
    asset.group = updateAssetDto.group;
    return this.assetRepository.save(asset);
  }

  async updateChange(
    asset: AssetEntity,
    id: string,
    updateBalanceChangeDto: UpdateBalanceChangeDto,
  ) {
    const change = await this.assetBalanceChangeRepository.findOneBy({
      id,
      assetId: asset.id,
    });
    if (change == null) {
      throw new NotFoundException();
    }
    change.capital = updateBalanceChangeDto.capital;
    change.value = updateBalanceChangeDto.value;
    change.date = updateBalanceChangeDto.date;
    return this.assetBalanceChangeRepository.save(change);
  }

  async remove(asset: AssetEntity) {
    return this.assetRepository.remove(asset);
  }

  async removeChange(asset: AssetEntity, id: string) {
    const change = await this.assetBalanceChangeRepository.findOneBy({
      id,
      assetId: asset.id,
    });
    if (change == null) {
      throw new NotFoundException();
    }
    return this.assetBalanceChangeRepository.remove(change);
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
