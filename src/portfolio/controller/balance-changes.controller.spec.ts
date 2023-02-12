import { Test, TestingModule } from '@nestjs/testing';
import { BalanceChangesController } from './balance-changes.controller';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { PortfolioService } from '../service/portfolio.service';
import { AssetEntity } from '../model/asset.entity';
import { PortfolioEntity } from '../model/portfolio.entity';
import { createMock } from '@golevelup/ts-jest';
import { Request as ExpressRequest } from 'express';
import { AssetService } from '../service/asset.service';
import { AssetBalanceChangeEntity } from '../model/asset-balance-change.entity';
import { NotFoundException } from '@nestjs/common';

const moduleMocker = new ModuleMocker(global);
describe('BalanceChangesController', () => {
  let controller: BalanceChangesController;
  let asset: AssetEntity;
  let request: ExpressRequest;

  beforeEach(async () => {
    const portfolio = new PortfolioEntity();
    portfolio.id = 'portfolio-id';
    portfolio.userId = 'user-id';

    asset = new AssetEntity();
    asset.id = 'asset-id';
    asset.portfolio = portfolio;
    asset.portfolioId = portfolio.id;
    asset.balanceChanges = [];
    for (const date of ['2019-01-01', '2020-02-01', '2020-03-01']) {
      asset.balanceChanges.push(new AssetBalanceChangeEntity(100, 90, date));
    }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalanceChangesController],
      providers: [
        {
          provide: PortfolioService,
          useValue: {
            getAndCheckPortfolioForUser: (userId, portfolioId) =>
              Promise.resolve(
                userId === portfolio.userId && portfolioId === portfolio.id
                  ? portfolio
                  : null,
              ),
          },
        },
        {
          provide: AssetService,
          useValue: {
            findById: (id: string) =>
              Promise.resolve(asset.id === id ? asset : undefined),
            findChangesInGivenYear: (_asset: AssetEntity, year: number) => {
              if (_asset.id === asset.id) {
                return Promise.resolve(
                  asset.balanceChanges.filter(
                    (change) => new Date(change.date).getFullYear() === year,
                  ),
                );
              }
              throw new NotFoundException();
            },
            findAllChanges: (_asset: AssetEntity) => {
              if (_asset.id === asset.id) {
                return Promise.resolve(asset.balanceChanges);
              }
              throw new NotFoundException();
            },
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

    request = createMock<ExpressRequest>({ user: { id: portfolio.userId } });
    controller = module.get<BalanceChangesController>(BalanceChangesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all balance changes', async () => {
    const result = await controller.findAll(request, asset.id);
    expect(result).toEqual(asset.balanceChanges);
  });

  it('should return balance changes for given year', async () => {
    const result = await controller.findAll(request, asset.id, '2020');
    expect(result).toEqual(asset.balanceChanges.slice(1));
  });
});
