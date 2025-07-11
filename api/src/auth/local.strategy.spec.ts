import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from './service/auth.service';
import { UserEntity } from './model/user.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should return the user when validation is successful', async () => {
    const mockUser = new UserEntity();
    mockUser.email = 'test@example.com';
    jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);

    const result = await strategy.validate('test@example.com', 'password');

    expect(result).toEqual(mockUser);
    expect(authService.validateUser).toHaveBeenCalledWith(
      'test@example.com',
      'password',
    );
  });

  it('should throw UnauthorizedException when validation fails', async () => {
    jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

    await expect(
      strategy.validate('test@example.com', 'password'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
