import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';

export const SKIP_JWT_AUTH_KEY = 'skipAppAuth';
export const SkipAppAuth = () => SetMetadata(SKIP_JWT_AUTH_KEY, true);

@Injectable()
export class AppAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipJwt = this.reflector.getAllAndOverride<boolean>(
      SKIP_JWT_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skipJwt) {
      return true;
    }
    const result = await super.canActivate(context);
    return !!result;
  }
}
