import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from './user.service';

jest.mock('bcryptjs');

const moduleMocker = new ModuleMocker(global);
describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn((payload: object) => JSON.stringify(payload)),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn(),
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

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should login user via JWT', async () => {
      const user = { email: 'test@test.com', id: 'user-id' };
      const result = await service.login(user);
      expect(result).toEqual({
        accessToken: expect.stringMatching(/.{10,}/),
        userEmail: user.email,
      });
      expect(jwtService.sign).toBeCalledWith({
        email: user.email,
        sub: user.id,
      });
    });

    it('should return null if user is not provided', async () => {
      const result = await service.login(undefined);
      expect(result).toBeNull();
    });
  });

  describe('validateUser', () => {
    beforeEach(() => {
      (bcrypt.compare as jest.Mock).mockClear();
    });
    it('should validate user with correct credentials', async () => {
      const userInDb = {
        id: 'user-id',
        email: 'test@test.com',
        password: 'hashed-password',
      } as any;
      (userService.findOneByEmail as jest.Mock).mockResolvedValueOnce(userInDb);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.validateUser('test@test.com', 'password');
      expect(result).toEqual({ id: userInDb.id, email: userInDb.email });
      expect(userService.findOneByEmail).toBeCalledWith('test@test.com');
    });

    it('should return null when password is wrong', async () => {
      const userInDb = {
        id: 'user-id',
        email: 'test@test.com',
        password: 'hashed-password',
      } as any;
      (userService.findOneByEmail as jest.Mock).mockResolvedValueOnce(userInDb);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await service.validateUser(
        'test@test.com',
        'wrong-password',
      );
      expect(result).toBeNull();
    });

    it('should return null when user is not found', async () => {
      (userService.findOneByEmail as jest.Mock).mockResolvedValueOnce(null);
      const result = await service.validateUser(
        'non-existent@test.com',
        'password',
      );
      expect(result).toBeNull();
      expect(userService.findOneByEmail).toBeCalledWith(
        'non-existent@test.com',
      );
      expect(bcrypt.compare).not.toBeCalled();
    });
  });
});
