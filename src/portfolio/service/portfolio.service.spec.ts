import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from './portfolio.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FixturesService,
  testDataSourceConfig,
} from '../fixtures/fixtures-service';
import { PortfolioEntity } from '../model/portfolio.entity';
import { AssetEntity } from '../model/asset.entity';
import { AssetBalanceChangeEntity } from '../model/asset-balance-change.entity';
import 'reflect-metadata';
import * as fs from 'fs';
import { AssetService } from './asset.service';

const moduleMocker = new ModuleMocker(global);

describe('PortfolioService', () => {
  let service: PortfolioService;
  let fixturesService: FixturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDataSourceConfig),
        TypeOrmModule.forFeature([
          PortfolioEntity,
          AssetEntity,
          AssetBalanceChangeEntity,
        ]),
      ],
      providers: [PortfolioService, FixturesService, AssetService],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();
    fixturesService = module.get<FixturesService>(FixturesService);
    service = module.get<PortfolioService>(PortfolioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('prepareAssetsSnapshot', () => {
    beforeEach(async () => {
      await fixturesService.loadFixtures();
    });

    it('should prepare proper newest assets snapshot', async () => {
      const assetsSnapshot = JSON.parse(
        fs.readFileSync('src/portfolio/fixtures/assets-snapshot.json', 'utf8'),
      );
      const portfolio = await fixturesService.getPortfolio();
      const result = await service.prepareAssetsSnapshot(portfolio);
      expect(result).toMatchObject(assetsSnapshot);
    });
  });
});
