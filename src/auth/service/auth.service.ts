import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Express.User | null> {
    const user = await this.userService.findOne(email);
    if (user && user.password === password) {
      return { email: user.email, id: user.id };
    }
    return null;
  }

  async login(user?: Express.User) {
    const payload = { email: user?.email, sub: user?.id };
    return {
      // user: await this.prepareUserAccount(user.id),
      user: payload,
      accessToken: this.jwtService.sign(payload),
    };
  }
}
