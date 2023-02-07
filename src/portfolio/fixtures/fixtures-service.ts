import { PortfolioEntity } from '../model/portfolio.entity';
import { Repository } from 'typeorm';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import { AssetEntity } from '../model/asset.entity';
import * as fs from 'fs';
import { AssetBalanceChangeEntity } from '../model/asset-balance-change.entity';
import 'reflect-metadata';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

export const testDataSourceConfig: DataSourceOptions = {
  // type: 'sqlite',
  // database: ':memory:',
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'assets_wallet',
  password: 'awd9571',
  database: 'assets_wallet_test',
  entities: [PortfolioEntity, AssetEntity, AssetBalanceChangeEntity],
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
    const portfolio: PortfolioEntity = {
      id: portfolioId,
      createdAt: new Date(),
      updatedAt: new Date(),
      assets: [],
    };
    await this.portfolioRepository.save(portfolio);
    await this.loadAssetsFixtures(portfolio);
    await this.loadAssetBalanceChangeFixtures();
  }

  private async loadAssetsFixtures(portfolio: PortfolioEntity) {
    fs.readFile(
      'src/portfolio/fixtures/assets.json',
      'utf8',
      (_, jsonString) => {
        const assets = JSON.parse(jsonString);
        assets.forEach((asset: AssetEntity) => {
          asset.portfolio = portfolio;
          this.assetRepository.save(asset);
        });
      },
    );
  }

  private async loadAssetBalanceChangeFixtures() {
    fs.readFile(
      'src/portfolio/fixtures/asset-balance-changes.json',
      'utf8',
      (_, jsonString) => {
        const assetBalanceChanges = JSON.parse(jsonString);
        assetBalanceChanges.forEach(
          (assetBalanceChange: AssetBalanceChangeEntity) => {
            this.assetBalanceChangeRepository.save(assetBalanceChange);
          },
        );
      },
    );
  }
}
