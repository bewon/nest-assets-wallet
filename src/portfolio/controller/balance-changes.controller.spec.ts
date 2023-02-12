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
import { CreateBalanceChangeDto } from '../dto/create-balance-change.dto';
import { UpdateBalanceChangeDto } from '../dto/update-balance-change.dto';

const moduleMocker = new ModuleMocker(global);
describe('BalanceChangesController', () => {
  let controller: BalanceChangesController;
  let asset: AssetEntity;
  let request: ExpressRequest;
  let balanceChange: AssetBalanceChangeEntity;

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
      const change = new AssetBalanceChangeEntity(100, 90, date);
      change.id = 'id-' + date;
      asset.balanceChanges.push(change);
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
            createChange: (
              _asset: AssetEntity,
              createBalanceChangeDto: CreateBalanceChangeDto,
            ) => {
              if (_asset.id === asset.id) {
                balanceChange = new AssetBalanceChangeEntity(
                  createBalanceChangeDto.capital,
                  createBalanceChangeDto.value,
                  createBalanceChangeDto.date,
                );
                balanceChange.asset = asset;
                return Promise.resolve(balanceChange);
              }
              throw new NotFoundException();
            },
            updateChange: (
              _asset: AssetEntity,
              id: string,
              updateBalanceChangeDto: UpdateBalanceChangeDto,
            ) => {
              if (_asset.id === asset.id) {
                const change = asset.balanceChanges.find(
                  (change) => change.id === id,
                );
                if (change) {
                  change.capital = updateBalanceChangeDto.capital;
                  change.value = updateBalanceChangeDto.value;
                  change.date = updateBalanceChangeDto.date;
                  return Promise.resolve(change);
                }
              }
              throw new NotFoundException();
            },
            removeChange: (_asset: AssetEntity, id: string) => {
              if (_asset.id === asset.id) {
                const change = asset.balanceChanges.find(
                  (change) => change.id === id,
                );
                if (change) {
                  asset.balanceChanges = asset.balanceChanges.filter(
                    (change) => change.id !== id,
                  );
                  return Promise.resolve(change);
                }
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

  it('should create a new balance change', async () => {
    const result = await controller.create(request, asset.id, {
      date: '2020-04-01',
      value: 100,
      capital: 90,
    });
    expect(result).toEqual(balanceChange);
    expect(balanceChange.asset).toEqual(asset);
  });

  it('should throw an error during crate a balance change if asset does not exist', async () => {
    await expect(
      controller.create(request, 'non-existing-id', {
        date: '2020-04-01',
        value: 100,
        capital: 90,
      }),
    ).rejects.toThrowError(NotFoundException);
  });

  it('should update a balance change', async () => {
    const result = await controller.update(request, asset.id, 'id-2020-02-01', {
      date: '2018-04-01',
      value: 50.5,
      capital: 60.5,
    });
    expect(result).toEqual(asset.balanceChanges[1]);
    expect(result.date).toEqual('2018-04-01');
    expect(result.value).toEqual(50.5);
    expect(result.capital).toEqual(60.5);
  });

  it('should throw an error during update a balance change if asset does not exist', async () => {
    await expect(
      controller.update(request, 'non-existing-id', 'id-2020-02-01', {
        date: '2018-04-01',
        value: 50.5,
        capital: 60.5,
      }),
    ).rejects.toThrowError(NotFoundException);
  });

  it('should remove a balance change', async () => {
    await controller.remove(request, asset.id, 'id-2020-02-01');
    expect(asset.balanceChanges).toHaveLength(2);
  });

  it('should throw an error during removing a balance change if asset does not exist', async () => {
    await expect(
      controller.remove(request, 'non-existing-id', 'id-2020-02-01'),
    ).rejects.toThrowError(NotFoundException);
  });
});
