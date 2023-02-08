import { Test, TestingModule } from '@nestjs/testing';
import { PortfoliosController } from './portfolios.controller';
import { PortfolioService } from '../service/portfolio.service';
import { PortfolioEntity } from '../model/portfolio.entity';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { AssetSnapshotDto } from '../dto/asset-snapshot.dto';

const moduleMocker = new ModuleMocker(global);
describe('PortfoliosController', () => {
  let controller: PortfoliosController;
  let portfolio: PortfolioEntity;

  beforeEach(async () => {
    portfolio = {
      id: 'xyz',
      assets: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfoliosController],
      providers: [
        {
          provide: PortfolioService,
          useValue: {
            findById: (id) =>
              Promise.resolve(id === portfolio.id ? portfolio : null),
            prepareAssetsSnapshot: (portfolio, date: string) =>
              Promise.resolve({
                id: portfolio.id,
                name: 'abc',
                group: 'abc',
                date: date,
              } as AssetSnapshotDto),
          },
        },
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

    controller = module.get<PortfoliosController>(PortfoliosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return portfolio', async () => {
    expect(await controller.findById(portfolio.id)).toBe(portfolio);
  });

  it('should return null for non-existing portfolio', async () => {
    expect(await controller.findById('abc')).toBeNull();
  });
  it('should return asset snapshot', async () => {
    expect(
      await controller.findAssetsSnapshot(portfolio.id, '2020-01-01'),
    ).toEqual({
      id: portfolio.id,
      name: 'abc',
      group: 'abc',
      date: '2020-01-01',
    } as AssetSnapshotDto);
  });
});
