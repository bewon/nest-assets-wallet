import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../model/user.entity';
import { Repository } from 'typeorm';

const moduleMocker = new ModuleMocker(global);
describe('UsersService', () => {
  let service: UserService;
  let userRepository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOneBy: jest.fn(({ email }) =>
              Promise.resolve({ id: 'xyz', email }),
            ),
            save: jest.fn((user) => Promise.resolve({ id: 'xyz', ...user })),
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
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find user by email', async () => {
    const user = await service.findOneByEmail('test@test.com');
    expect(user).toEqual({ id: 'xyz', email: 'test@test.com' });
    expect(userRepository.findOneBy).toBeCalledTimes(1);
    expect(userRepository.findOneBy).toBeCalledWith({
      email: 'test@test.com',
    });
  });

  it('should create user via createUser method', async () => {
    const user = await service.createUser('test@test.com', 'password');
    expect(user).toEqual({
      id: 'xyz',
      email: 'test@test.com',
      password: expect.any(String),
    });
    expect(userRepository.save).toBeCalledTimes(1);
    expect(userRepository.save).toBeCalledWith({
      email: 'test@test.com',
      password: expect.stringMatching(/.{30,}/),
    });
  });
});
