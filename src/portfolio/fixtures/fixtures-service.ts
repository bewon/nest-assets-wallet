import { PortfolioEntity } from '../model/portfolio.entity';
import { Repository } from 'typeorm';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import { AssetEntity } from '../model/asset.entity';
import { promises as fs } from 'fs';
import { AssetBalanceChangeEntity } from '../model/asset-balance-change.entity';
import 'reflect-metadata';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../auth/model/user.entity';

export const entities = [
  PortfolioEntity,
  AssetEntity,
  AssetBalanceChangeEntity,
  UserEntity,
];

export const testDataSourceConfig: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  // type: 'postgres',
  // host: 'localhost',
  // port: 5432,
  // username: 'assets_wallet',
  // password: 'awd9571',
  // database: 'assets_wallet_test',
  entities,
  synchronize: true,
};

const portfolioId = 'ef9f67ca-a5fe-11ed-afa1-0242ac120002';

@Injectable()
export class FixturesService {
  constructor(
    @InjectRepository(PortfolioEntity)
    private readonly portfolioRepository: Repository<PortfolioEntity>,
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
    @InjectRepository(AssetBalanceChangeEntity)
    private readonly assetBalanceChangeRepository: Repository<AssetBalanceChangeEntity>,
  ) {}

  public async getPortfolio(): Promise<PortfolioEntity> {
    return this.portfolioRepository.findOneOrFail({
      where: { id: portfolioId },
    });
  }

  public async loadFixtures() {
    await this.assetBalanceChangeRepository.delete({});
    await this.assetRepository.delete({});
    await this.portfolioRepository.delete({});
    const portfolio = await this.portfolioRepository.save({ id: portfolioId });
    await this.loadAssetsFixtures(portfolio);
    await this.loadAssetBalanceChangeFixtures();
  }

  private async loadAssetsFixtures(portfolio: PortfolioEntity) {
    const jsonString = await fs.readFile(
      'src/portfolio/fixtures/assets.json',
      'utf8',
    );
    const assets = JSON.parse(jsonString);
    for (const asset of assets) {
      asset.portfolio = portfolio;
      await this.assetRepository.save(asset);
    }
  }

  private async loadAssetBalanceChangeFixtures() {
    const jsonString = await fs.readFile(
      'src/portfolio/fixtures/asset-balance-changes.json',
      'utf8',
    );
    const assetBalanceChanges = JSON.parse(jsonString);
    for (const assetBalanceChange of assetBalanceChanges) {
      await this.assetBalanceChangeRepository.save(assetBalanceChange);
    }
  }
}
