import { Test, TestingModule } from '@nestjs/testing';
import { PortfoliosController } from './portfolios.controller';
import { PortfolioService } from '../service/portfolio.service';
import { PortfolioEntity } from '../model/portfolio.entity';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { AssetSnapshotDto } from '../dto/asset-snapshot.dto';
import { createMock } from '@golevelup/ts-jest';
import { Request as ExpressRequest } from 'express';

const moduleMocker = new ModuleMocker(global);
describe('PortfoliosController', () => {
  let controller: PortfoliosController;
  let portfolio: PortfolioEntity;
  let request: ExpressRequest;

  beforeEach(async () => {
    portfolio = new PortfolioEntity();
    portfolio.id = 'xyz';
    portfolio.assets = [];
    portfolio.userId = 'user-id';

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
            getAndCheckPortfolioForUser: (userId, portfolioId) =>
              Promise.resolve(
                userId === portfolio.userId && portfolioId === portfolio.id
                  ? portfolio
                  : null,
              ),
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
    request = createMock<ExpressRequest>({ user: { id: portfolio.userId } });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return portfolio', async () => {
    expect(await controller.findById(request, portfolio.id)).toBe(portfolio);
  });

  it('should return asset snapshot', async () => {
    expect(
      await controller.findAssetsSnapshot(request, portfolio.id, '2020-01-01'),
    ).toEqual({
      id: portfolio.id,
      name: 'abc',
      group: 'abc',
      date: '2020-01-01',
    } as AssetSnapshotDto);
  });
});
