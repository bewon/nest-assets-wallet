import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../model/user.entity';

const moduleMocker = new ModuleMocker(global);
describe('UsersService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: (id) =>
              Promise.resolve(id === 'xyz' ? { id: 'xyz' } : null),
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

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
