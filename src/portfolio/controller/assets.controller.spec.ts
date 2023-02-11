import { Test, TestingModule } from '@nestjs/testing';
import { AssetsController } from './assets.controller';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { AssetService } from '../service/asset.service';
import { PortfolioService } from '../service/portfolio.service';
import { AssetEntity } from '../model/asset.entity';
import { PortfolioEntity } from '../model/portfolio.entity';
import { Request as ExpressRequest } from 'express';
import { createMock } from '@golevelup/ts-jest';
import { CreateAssetDto } from '../dto/create-asset.dto';

const moduleMocker = new ModuleMocker(global);
describe('AssetsController', () => {
  let controller: AssetsController;
  let asset: AssetEntity;
  let portfolio: PortfolioEntity;
  let request: ExpressRequest;

  beforeEach(async () => {
    portfolio = new PortfolioEntity();
    portfolio.userId = 'user-id';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
      providers: [
        {
          provide: AssetService,
          useValue: {
            create: (portfolioId, createAssetDto) => {
              asset = new AssetEntity();
              asset.name = createAssetDto.name;
              asset.portfolio = portfolio;
              return Promise.resolve(asset);
            },
          },
        },
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
    controller = module.get<AssetsController>(AssetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an asset', async () => {
    const createAssetDto: CreateAssetDto = {
      name: 'abc',
      date: '2020-01-01',
      capital: 81.5,
      value: 90.5,
    };
    const result = await controller.create(
      request,
      portfolio.id,
      createAssetDto,
    );
    expect(result).toEqual(asset);
    expect(asset.name).toEqual(createAssetDto.name);
  });
});
