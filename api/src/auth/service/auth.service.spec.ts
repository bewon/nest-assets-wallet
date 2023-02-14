import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { JwtService } from '@nestjs/jwt';

const moduleMocker = new ModuleMocker(global);
describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should login user via JWT', async () => {
    const user = { email: 'test@test.com', id: 'user-id' };
    const result = await service.login(user);
    expect(result).toEqual({
      accessToken: expect.stringMatching(/.{10,}/),
      user: { email: user.email, sub: user.id },
    });
    expect(jwtService.sign).toBeCalledWith({ email: user.email, sub: user.id });
  });
});
