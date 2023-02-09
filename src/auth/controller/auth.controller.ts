import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from '../service/auth.service';
import { LocalAuthGuard } from '../local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: ExpressRequest) {
    return this.authService.login(req.user);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('test')
  // async test(@Request() req: ExpressRequest) {
  //   return req.user;
  // }
}
