import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

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
      user: payload,
      // user: await this.prepareUserAccount(user.id),
      // accessToken: this.jwtService.sign(payload),
    };
  }
}
