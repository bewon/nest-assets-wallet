import { AppAuthGuard, SKIP_JWT_AUTH_KEY } from './app-auth.guard.service';
import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Test } from '@nestjs/testing';

describe('AppAuthGuard', () => {
  let guard: AppAuthGuard;

  const mockExecutionContext = (hasDecorator?: boolean): ExecutionContext => {
    const context: Partial<ExecutionContext> = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };
    if (hasDecorator) {
      SetMetadata(SKIP_JWT_AUTH_KEY, true)(context.getHandler as any);
    }
    return context as ExecutionContext;
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AppAuthGuard],
    }).compile();

    guard = module.get<AppAuthGuard>(AppAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should call super.canActivate when SkipAppAuth decorator is not used', async () => {
    const context = mockExecutionContext();
    const superCanActivate = jest
      .spyOn(Object.getPrototypeOf(guard), 'canActivate')
      .mockResolvedValue(true);

    await guard.canActivate(context);
    expect(superCanActivate).toBeCalled();
  });

  it('should return true when super.canActivate returns true', async () => {
    const context = mockExecutionContext();
    jest
      .spyOn(Object.getPrototypeOf(guard), 'canActivate')
      .mockResolvedValue(true);
    const canActivate = await guard.canActivate(context);
    expect(canActivate).toBe(true);
  });

  it('should return false when super.canActivate returns false', async () => {
    const context = mockExecutionContext();
    jest
      .spyOn(Object.getPrototypeOf(guard), 'canActivate')
      .mockResolvedValue(false);
    const canActivate = await guard.canActivate(context);
    expect(canActivate).toBe(false);
  });
});
