import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { createMock } from '@golevelup/ts-jest';
import { Request as ExpressRequest } from 'express';
import { AuthService } from '../service/auth.service';

const moduleMocker = new ModuleMocker(global);
describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: (user?: Express.User) => {
              const payload = { email: user?.email, sub: user?.id };
              return {
                user: payload,
                accessToken: 'token',
              };
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

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should login user', async () => {
    const user = { email: 'test@test.com', id: 'user-id' };
    const request = createMock<ExpressRequest>({ user });
    const result = await controller.login(request);
    expect(result).toEqual({
      accessToken: expect.any(String),
      user: { email: user.email, sub: user.id },
    });
  });
});
