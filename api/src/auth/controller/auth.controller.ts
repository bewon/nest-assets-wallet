import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from '../service/auth.service';
import { LocalAuthGuard } from '../local-auth.guard';
import { SkipAppAuth } from '../app-auth.guard.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @SkipAppAuth()
  @Post('login')
  async login(@Request() req: ExpressRequest) {
    return this.authService.login(req.user);
  }
}
