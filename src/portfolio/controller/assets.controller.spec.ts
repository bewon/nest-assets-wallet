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
import { UpdateAssetDto } from '../dto/update-asset.dto';

const moduleMocker = new ModuleMocker(global);
describe('AssetsController', () => {
  let controller: AssetsController;
  let asset: AssetEntity | undefined;
  let portfolio: PortfolioEntity;
  let request: ExpressRequest;

  beforeEach(async () => {
    portfolio = new PortfolioEntity();
    portfolio.id = 'portfolio-id';
    portfolio.userId = 'user-id';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
      providers: [
        {
          provide: AssetService,
          useValue: {
            create: (portfolioId: string, createAssetDto: CreateAssetDto) => {
              if (portfolioId !== portfolio.id) {
                return Promise.resolve(null);
              }
              asset = new AssetEntity();
              asset.name = createAssetDto.name;
              asset.portfolio = portfolio;
              asset.portfolioId = portfolio.id;
              return Promise.resolve(asset);
            },
            update: (asset: AssetEntity, updateAssetDto: UpdateAssetDto) => {
              asset.name = updateAssetDto.name;
              asset.group = updateAssetDto.group;
              return Promise.resolve(asset);
            },
            findById: (id) => Promise.resolve(asset?.id === id ? asset : null),
            remove: (_asset) => {
              if (_asset.id === asset?.id) {
                asset = undefined;
              }
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
    expect(asset?.name).toEqual(createAssetDto.name);
  });

  it('should update an asset', async () => {
    asset = new AssetEntity();
    asset.id = 'asset-id';
    asset.name = 'Name1';
    asset.group = 'Group1';
    asset.portfolio = portfolio;
    asset.portfolioId = portfolio.id;
    const updateAssetDto: UpdateAssetDto = {
      name: 'Name2',
      group: 'Group2',
    };
    const result = await controller.update(request, asset.id, updateAssetDto);
    expect(result).toEqual(asset);
    expect(asset.name).toEqual(updateAssetDto.name);
    expect(asset.group).toEqual(updateAssetDto.group);
  });

  it('should remove an asset', async () => {
    asset = new AssetEntity();
    asset.id = 'asset-id';
    asset.portfolio = portfolio;
    asset.portfolioId = portfolio.id;
    await controller.remove(request, asset.id);
    expect(asset).toBeUndefined();
  });
});
