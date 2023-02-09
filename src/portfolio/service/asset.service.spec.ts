import { Test, TestingModule } from '@nestjs/testing';
import { AssetService } from './asset.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import {
  entities,
  FixturesService,
  testDataSourceConfig,
} from '../fixtures/fixtures-service';
import { AssetEntity } from '../model/asset.entity';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import * as fs from 'fs';
import { Repository } from 'typeorm';

const moduleMocker = new ModuleMocker(global);
describe('AssetService', () => {
  let service: AssetService;
  let fixturesService: FixturesService;
  let assetRepository: Repository<AssetEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDataSourceConfig),
        TypeOrmModule.forFeature(entities),
      ],
      providers: [AssetService, FixturesService],
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

    service = module.get<AssetService>(AssetService);
    fixturesService = module.get<FixturesService>(FixturesService);
    assetRepository = module.get<Repository<AssetEntity>>(
      getRepositoryToken(AssetEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('prepareAssetSnapshot', () => {
    beforeEach(async () => {
      await fixturesService.loadFixtures();
    });

    it('should prepare proper newest asset snapshot', async () => {
      const assetSnapshot = JSON.parse(
        fs.readFileSync('src/portfolio/fixtures/assets-snapshot.json', 'utf8'),
      )[0];
      const asset = await assetRepository.findOneByOrFail({
        id: '47158934-82df-43ac-8a24-000000000001',
      });
      const result = await service.prepareAssetSnapshot(asset);
      expect(result).toEqual(assetSnapshot);
    });

    it('should prepare proper asset snapshot for given date', async () => {
      const files = {
        '2015-01-01': 'assets-snapshot-for-2015-01-01.json',
        '2016-03-02': 'assets-snapshot.json',
      };
      for (const [date, file] of Object.entries(files)) {
        const assetSnapshot = JSON.parse(
          fs.readFileSync(`src/portfolio/fixtures/${file}`, 'utf8'),
        )[0];
        const asset = await assetRepository.findOneByOrFail({
          id: '47158934-82df-43ac-8a24-000000000001',
        });
        const result = await service.prepareAssetSnapshot(asset, date);
        expect(result).toEqual(assetSnapshot);
      }
    });

    it('should return empty snapshot if all changes are after given date', async () => {
      const asset = await assetRepository.findOneByOrFail({
        id: '47158934-82df-43ac-8a24-000000000001',
      });
      const assetSnapshot = {
        id: asset.id,
        name: asset.name,
        group: asset.group,
      };
      const result = await service.prepareAssetSnapshot(asset, '2012-12-12');
      expect(result).toEqual(assetSnapshot);
    });

    it('should return empty snapshot if there is no changes', async () => {
      const emptyAsset = new AssetEntity();
      emptyAsset.portfolio = await fixturesService.getPortfolio();
      emptyAsset.name = 'empty';
      await assetRepository.save(emptyAsset);
      const assetSnapshot = {
        id: emptyAsset.id,
        name: emptyAsset.name,
        group: emptyAsset.group,
      };
      const result = await service.prepareAssetSnapshot(emptyAsset);
      expect(result).toEqual(assetSnapshot);
    });
  });
});
