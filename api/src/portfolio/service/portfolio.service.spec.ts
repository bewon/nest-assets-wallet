import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from './portfolio.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import {
  entities,
  FixturesService,
  testDataSourceConfig,
} from '../fixtures/fixtures-service';
import { PortfolioEntity } from '../model/portfolio.entity';
import { AssetEntity } from '../model/asset.entity';
import { AssetBalanceChangeEntity } from '../model/asset-balance-change.entity';
import 'reflect-metadata';
import * as fs from 'fs';
import { AssetService } from './asset.service';
import { PortfolioBalanceChangeSetService } from './portfolio-balance-change-set.service';
import { Repository } from 'typeorm';

const moduleMocker = new ModuleMocker(global);

describe('PortfolioService', () => {
  let service: PortfolioService;
  let fixturesService: FixturesService;
  let portfolioRepository: Repository<PortfolioEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDataSourceConfig),
        TypeOrmModule.forFeature(entities),
      ],
      providers: [
        PortfolioService,
        FixturesService,
        AssetService,
        PortfolioBalanceChangeSetService,
      ],
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
    portfolioRepository = module.get<Repository<PortfolioEntity>>(
      getRepositoryToken(PortfolioEntity),
    );
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
      expect(result).toEqual(assetsSnapshot);
    });

    it('should prepare proper assets snapshot for given date', async () => {
      const assetsSnapshot = JSON.parse(
        fs.readFileSync(
          'src/portfolio/fixtures/assets-snapshot-for-2015-01-01.json',
          'utf8',
        ),
      );
      const result = await service.prepareAssetsSnapshot(
        await fixturesService.getPortfolio(),
        '2015-01-01',
      );
      expect(result).toEqual(assetsSnapshot);
    });
  });
  describe('preparePerformanceStatistics', () => {
    beforeEach(async () => {
      await fixturesService.loadFixtures();
    });

    it('should prepare proper newest performance statistics', async () => {
      const performanceStatistics = JSON.parse(
        fs.readFileSync(
          'src/portfolio/fixtures/performance-statistics.json',
          'utf8',
        ),
      );
      const result = await service.preparePerformanceStatistics(
        await fixturesService.getPortfolio(),
        '2016-03-31',
      );
      expect(result).toEqual(performanceStatistics);
    });

    it('should prepare proper performance statistics for given group', async () => {
      const performanceStatistics = JSON.parse(
        fs.readFileSync(
          'src/portfolio/fixtures/performance-statistics-for-risky-group.json',
          'utf8',
        ),
      );
      const result = await service.preparePerformanceStatistics(
        await fixturesService.getPortfolio(),
        '2016-03-31',
        'Risky',
      );
      expect(result).toEqual(performanceStatistics);
    });

    it('should prepare proper newest performance statistics without assets', async () => {
      const performanceStatistics = JSON.parse(
        fs.readFileSync(
          'src/portfolio/fixtures/performance-statistics.json',
          'utf8',
        ),
      );
      delete performanceStatistics.assets;
      const result = await service.preparePerformanceStatistics(
        await fixturesService.getPortfolio(),
        '2016-03-31',
        undefined,
        false,
      );
      expect(result).toEqual(performanceStatistics);
    });

    it('should prepare proper performance statistics for given date', async () => {
      const performanceStatistics = JSON.parse(
        fs.readFileSync(
          'src/portfolio/fixtures/performance-statistics-for-2015-01-01.json',
          'utf8',
        ),
      );
      const result = await service.preparePerformanceStatistics(
        await fixturesService.getPortfolio(),
        '2015-01-01',
      );
      expect(result).toEqual(performanceStatistics);
    });

    it('should prepare proper performance statistics for empty portfolio', async () => {
      const performanceStatistics = {
        assets: [],
        portfolio: {},
      };
      const portfolio = new PortfolioEntity();
      await portfolioRepository.save(portfolio);
      const result = await service.preparePerformanceStatistics(portfolio);
      expect(result).toEqual(performanceStatistics);
    });

    it('should prepare proper performance statistics for portfolio with only one change', async () => {
      const portfolio: PortfolioEntity = new PortfolioEntity();
      const asset = new AssetEntity();
      const change = new AssetBalanceChangeEntity(1.0, 1.0, '2015-01-01');
      asset.name = 'Test';
      asset.group = 'group';
      asset.balanceChanges = [change];
      portfolio.assets = [asset];
      await portfolioRepository.save(portfolio);
      const performanceStatistics = {
        assets: [{ annualizedTwr: {}, id: asset.id }],
        portfolio: {},
      };
      const result = await service.preparePerformanceStatistics(portfolio);
      expect(result).toEqual(performanceStatistics);
    });
  });

  describe('prepareHistoryStatistics', () => {
    beforeEach(async () => {
      await fixturesService.loadFixtures();
    });

    it('should prepare proper history statistics', async () => {
      const historyStatistics = JSON.parse(
        fs.readFileSync(
          'src/portfolio/fixtures/history-statistics.json',
          'utf8',
        ),
      );
      const result = await service.prepareHistoryStatistics(
        await fixturesService.getPortfolio(),
        undefined,
        true,
      );
      expect(result).toEqual(historyStatistics);
    });

    it('should prepare proper history statistics for given group', async () => {
      const historyStatistics = JSON.parse(
        fs.readFileSync(
          'src/portfolio/fixtures/history-statistics-for-risky-group.json',
          'utf8',
        ),
      );
      const result = await service.prepareHistoryStatistics(
        await fixturesService.getPortfolio(),
        'Risky',
        true,
      );
      expect(result).toEqual(historyStatistics);
    });

    it('should prepare history statistics without assets by default', async () => {
      const portfolio = await fixturesService.getPortfolio();
      const result = await service.prepareHistoryStatistics(portfolio);
      expect(result.assets).toBeUndefined();
    });

    it('should prepare proper history statistics for empty portfolio', async () => {
      const portfolio = new PortfolioEntity();
      await portfolioRepository.save(portfolio);
      const historyStatistics = {
        assets: [],
        portfolio: [],
      };
      const result = await service.prepareHistoryStatistics(
        portfolio,
        undefined,
        true,
      );
      expect(result).toEqual(historyStatistics);
    });

    it('should prepare proper history statistics for portfolio with only one change', async () => {
      const portfolio: PortfolioEntity = new PortfolioEntity();
      const asset = new AssetEntity();
      const change = new AssetBalanceChangeEntity(110.0, 90.5, '2015-01-01');
      asset.name = 'Test';
      asset.group = 'group';
      asset.balanceChanges = [change];
      portfolio.assets = [asset];
      await portfolioRepository.save(portfolio);
      const values = [
        change.date,
        change.capital,
        change.value,
        change.getProfit(),
        null,
        null,
        null,
        null,
      ];
      const historyStatistics = {
        portfolio: [values],
        assets: [
          {
            id: asset.id,
            name: asset.name,
            group: asset.group,
            values: [values],
            value: change.value,
            capital: change.capital,
          },
        ],
      };
      const result = await service.prepareHistoryStatistics(
        portfolio,
        undefined,
        true,
      );
      expect(result).toEqual(historyStatistics);
    });
  });
});
