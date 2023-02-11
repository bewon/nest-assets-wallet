import { Test, TestingModule } from '@nestjs/testing';
import { AssetsController } from './assets.controller';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);
describe('AssetsController', () => {
  let controller: AssetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
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

    controller = module.get<AssetsController>(AssetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
